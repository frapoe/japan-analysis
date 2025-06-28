"use client";

import React, { useEffect, useRef, memo } from "react";
import dynamic from "next/dynamic";
import * as d3 from "d3";
import { GeoPath, GeoProjection } from "d3-geo";
import geoJson from "@/app/lib/japan.json";
import { Geometry } from 'geojson';

// Dynamically import PrefectureStats with no SSR to avoid window is not defined error
const PrefectureStats = dynamic(() => import("./PrefectureStats"), {
  ssr: false,
});

export type Prefecture = {
  name: string;
  count: number;
};

interface FeatureProperties {
  name: string;
  name_ja: string;
  [key: string]: string;
}

interface Feature {
  type: "Feature";
  properties: FeatureProperties;
  geometry: Geometry;
}

const JapanMap = ({ list }: { list: Prefecture[] }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // 色の設定
  const colorConfig = {
    hue: 220, // 色相 (0-360) - 180: 水色, 0/360: 赤, 120: 緑, 240: 青
    minSaturation: 20, // 最小彩度 (0-100)
    maxSaturation: 100, // 最大彩度 (0-100)
    lightness: 50, // 明度 (0-100)
    zeroCountColor: "#808080", // 訪問者0人の場合の色
  };

  useEffect(() => {
    if (!svgRef.current) return;

    // 既存のSVGをクリア
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 1000;
    const height = 1000;
    const backgroundColor = "#FFFFFF";
    const strokeColor = "#000000";
    const colorHover = "#0000FF";

    // 地図の投影法を設定
    const projection: GeoProjection = d3
      .geoMercator()
      .center([138, 38])
      .scale(2500)
      .translate([width / 2, height / 2]);

    // パスジェネレータ
    const path: GeoPath = d3.geoPath().projection(projection);

    // SVG要素を選択または作成
    const svg = d3.select(svgRef.current);

    // 背景を追加
    svg
      .append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", backgroundColor);

    // ツールチップ用のdivを作成
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px 12px")
      .style("border-radius", "4px")
      .style("box-shadow", "0 2px 4px rgba(0,0,0,0.2)")
      .style("pointer-events", "none")
      .style("font-size", "14px")
      .style("z-index", "10");

    // 都道府県のパスを描画
    svg
      .selectAll("path")
      .data(geoJson.features)
      .enter()
      .append("path")
      .attr("d", (d: unknown) => {
        const feature = d as Feature;
        return path(feature);
      })
      .attr("stroke", strokeColor) // 境界線を白に
      .attr("stroke-width", 0.5)
      .attr("fill", (d: unknown) => {
        const feature = d as Feature;
        const pref = list.find(
          (item) => item.name.toLowerCase() === feature.properties.name.toLowerCase()
        );
        if (!pref) return "#2d2d2d"; // データのない都道府県は少し暗いグレーに
        if (pref.count === 0) return colorConfig.zeroCountColor; // 訪問者数0の場合は指定色

        // 訪問者数に応じて色の彩度を変化（訪問者数が多いほど彩度が上がる）
        const maxCount = Math.max(...list.map((p) => p.count), 1);
        const saturationRange =
          colorConfig.maxSaturation - colorConfig.minSaturation;
        const saturation =
          colorConfig.minSaturation + (pref.count / maxCount) * saturationRange;
        return `hsl(${colorConfig.hue}, ${saturation}%, ${colorConfig.lightness}%)`;
      })
      .attr("opacity", 0.8)
      .style("cursor", "pointer")
      .on("mouseover", function (event: MouseEvent, d: unknown) {
        const feature = d as Feature;
        d3.select(this).attr("fill", colorHover).attr("opacity", 1);

        const prefName = feature.properties.name_ja;
        const pref = list.find(
          (item) => item.name.toLowerCase() === feature.properties.name.toLowerCase()
        ) || { name: feature.properties.name, count: 0 }; // 見つからない場合は0人として扱う

        tooltip
          .html(
            `
            <div>${prefName}</div>
            <div>訪問者数: ${pref.count}人</div>
          `
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
          .style("opacity", 1);

        tooltip.transition().duration(200).style("opacity", 0.9);
      })
      .on("mousemove", function (event: MouseEvent) {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function (event: MouseEvent, d: unknown) {
        const feature = d as Feature;
        d3.select(this)
          .attr("fill", () => {
            const pref = list.find(
              (item) =>
                item.name.toLowerCase() === feature.properties.name.toLowerCase()
            ) || { name: feature.properties.name, count: 0 };

            if (pref.count === 0) return colorConfig.zeroCountColor;

            const maxCount = Math.max(...list.map((p) => p.count), 1);
            const saturationRange =
              colorConfig.maxSaturation - colorConfig.minSaturation;
            const saturation =
              colorConfig.minSaturation +
              (pref.count / maxCount) * saturationRange;
            return `hsl(${colorConfig.hue}, ${saturation}%, ${colorConfig.lightness}%)`;
          })
          .attr("opacity", 0.8);
        tooltip
          .style("opacity", 0)
          .transition()
          .duration(500)
          .style("opacity", 0);
      });

    return () => {
      tooltip.remove();
    };
  }, [list, colorConfig.hue, colorConfig.lightness, colorConfig.maxSaturation, colorConfig.minSaturation, colorConfig.zeroCountColor]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#ffffff",
        padding: "0.5rem",
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: "500px",
          marginBottom: "0.5rem",
        }}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 1000 1000"
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#ffffff",
          }}
        />
      </div>
      <PrefectureStats list={list} colorConfig={colorConfig} />
    </div>
  );
};

export default memo(JapanMap);