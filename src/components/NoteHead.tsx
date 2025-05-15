import React from "react";
import { NoteType, NoteheadValue } from "../type";

interface NoteHeadProps {
  type?: NoteType;
  notehead?: NoteheadValue;
  x: number;
  y: number;
  elementKey: string;
}

export const NoteHead: React.FC<NoteHeadProps> = ({
  type,
  notehead,
  x,
  y,
  elementKey,
}) => {
  const renderDurationHead = () => {
    switch (type) {
      case "maxima":
        return (
          <g>
            <line
              x1={x - 16}
              y1={y - 4}
              x2={x + 16}
              y2={y - 4}
              stroke="black"
              strokeWidth={3}
            />
            <line
              x1={x - 16}
              y1={y + 4}
              x2={x + 16}
              y2={y + 4}
              stroke="black"
              strokeWidth={3}
            />
            <line
              x1={x - 16}
              y1={y - 8}
              x2={x - 16}
              y2={y + 8}
              stroke="black"
            />
            <line
              x1={x + 16}
              y1={y - 8}
              x2={x + 16}
              y2={y + 8}
              stroke="black"
            />
          </g>
        );
      case "long":
        return (
          <g>
            <line
              x1={x - 11}
              y1={y - 4}
              x2={x + 11}
              y2={y - 4}
              stroke="black"
              strokeWidth={3}
            />
            <line
              x1={x - 11}
              y1={y + 4}
              x2={x + 11}
              y2={y + 4}
              stroke="black"
              strokeWidth={3}
            />
            <line
              x1={x - 11}
              y1={y - 8}
              x2={x - 11}
              y2={y + 8}
              stroke="black"
            />
            <line
              x1={x + 11}
              y1={y - 8}
              x2={x + 11}
              y2={y + 8}
              stroke="black"
            />
          </g>
        );
      case "breve":
        return (
          <g>
            <mask id={elementKey}>
              <rect width={16} height={16} x={x - 8} y={y - 8} fill="white" />
              <ellipse
                cx={x}
                cy={y}
                rx={3}
                ry={4}
                fill={"black"}
                transform={`rotate(-27,${x},${y})`}
              />
            </mask>
            <ellipse mask={`url(#${elementKey})`} cx={x} cy={y} rx={8} ry={5} />
            <line x1={x - 8} y1={y - 8} x2={x - 8} y2={y + 8} stroke="black" />
            <line x1={x + 8} y1={y - 8} x2={x + 8} y2={y + 8} stroke="black" />
            <line
              x1={x - 11}
              y1={y - 8}
              x2={x - 11}
              y2={y + 8}
              stroke="black"
            />
            <line
              x1={x + 11}
              y1={y - 8}
              x2={x + 11}
              y2={y + 8}
              stroke="black"
            />
          </g>
        );
      case "whole":
        return (
          <g fill="black">
            <mask id={elementKey}>
              <rect width={16} height={16} x={x - 8} y={y - 8} fill="white" />
              <ellipse
                cx={x}
                cy={y}
                rx={3}
                ry={4}
                fill={"black"}
                transform={`rotate(-27,${x},${y})`}
              />
            </mask>
            <ellipse mask={`url(#${elementKey})`} cx={x} cy={y} rx={8} ry={5} />
          </g>
        );
      case "half":
      default:
        return (
          <g fill="black">
            <mask id={elementKey}>
              <rect width={12} height={12} x={x - 6} y={y - 6} fill="white" />
              <ellipse
                cx={x}
                cy={y}
                rx={5}
                ry={2}
                fill={type === "half" ? "black" : "white"}
              />
            </mask>
            <ellipse
              mask={`url(#${elementKey})`}
              cx={x}
              cy={y}
              rx={6}
              ry={4}
              transform={`rotate(-27,${x},${y})`}
            />
          </g>
        );
    }
  };

  // Special notehead renderings
  const renderSpecialNotehead = () => {
    switch (notehead) {
      case "arrow down":
        return (
          <g transform={`translate(${x},${y})`}>
            <path d="M 2.8764649e-7,3.6661739 -4.2333331,-3.666174 h 8.4666667 z" />
          </g>
        );
      case "arrow up":
        return (
          <g transform={`translate(${x},${y})`}>
            <path d="M 4.2333336,3.6661742 H -4.2333331 L 3.8764648e-7,-3.6661743 Z" />
          </g>
        );
      case "back slashed":
        return (
          <g>
            <ellipse
              cx={x}
              cy={y}
              rx={6}
              ry={4}
              transform={`rotate(-27,${x},${y})`}
              fill="black"
            />
            <line
              x1={x - 6}
              y1={y - 6}
              x2={x + 6}
              y2={y + 6}
              stroke="black"
              strokeWidth="1"
            />
          </g>
        );
      case "circle dot":
        return (
          <g>
            <circle
              cx={x}
              cy={y}
              r={5}
              fill="none"
              stroke="black"
              strokeWidth="1"
            />
            <circle cx={x} cy={y} r={1.5} fill="black" />
          </g>
        );
      case "circle-x":
        return (
          <g>
            <mask id={elementKey}>
              <circle cx={x} cy={y} r={5} fill="white" />
            </mask>
            <circle
              cx={x}
              cy={y}
              r={5}
              fill="none"
              stroke="black"
              strokeWidth="1"
            />
            <line
              mask={`url(#${elementKey})`}
              x1={x - 5}
              y1={y - 5}
              x2={x + 5}
              y2={y + 5}
              stroke="black"
              strokeWidth="1"
            />
            <line
              mask={`url(#${elementKey})`}
              x1={x - 5}
              y1={y + 5}
              x2={x + 5}
              y2={y - 5}
              stroke="black"
              strokeWidth="1"
            />
          </g>
        );
      case "circled":
        return (
          <g>
            <circle
              cx={x}
              cy={y}
              r={5}
              fill="none"
              stroke="black"
              strokeWidth="1"
            />
            <mask id={elementKey}>
              <rect width={12} height={12} x={x - 6} y={y - 6} fill="white" />
              <ellipse cx={x} cy={y} rx={4} ry={1} fill="black" />
            </mask>
            <ellipse
              mask={`url(#${elementKey})`}
              cx={x}
              cy={y}
              rx={5}
              ry={3}
              transform={`rotate(-27,${x},${y})`}
            />
          </g>
        );
      case "cluster":
        return (
          <g>
            <ellipse
              cx={x}
              cy={y}
              rx={6}
              ry={4}
              transform={`rotate(-27,${x},${y})`}
            />
            <ellipse
              cx={x}
              cy={y + 2.5}
              rx={6}
              ry={4}
              transform={`rotate(-27,${x},${y + 2.5})`}
            />
            <ellipse
              cx={x}
              cy={y + 5}
              rx={6}
              ry={4}
              transform={`rotate(-27,${x},${y + 5})`}
            />
          </g>
        );
      case "cross":
        return (
          <g>
            <line x1={x - 5} y1={y} x2={x + 5} y2={y} stroke="black" />
            <line x1={x} y1={y - 5} x2={x} y2={y + 5} stroke="black" />
          </g>
        );
      case "diamond":
        return (
          <rect
            x={x - 3.5355339}
            y={y - 3.5355339}
            width={7.0710678}
            height={7.0710678}
            transform={`rotate(-45,${x},${y})`}
          />
        );
      case "do":
        return (
          <g transform={`translate(${x},${y})`}>
            <path d="M 4.2333336,3.6661742 H -4.2333331 L 3.8764648e-7,-3.6661743 Z" />
          </g>
        );
      case "fa":
        return (
          <g>
            <mask id={elementKey}>
              <rect
                x={x - 7.071067812}
                y={y - 14.142135624}
                width={14.142135624}
                height={14.142135624}
                fill="white"
                transform={`rotate(-45,${x},${y})`}
              />
            </mask>
            <rect
              mask={`url(#${elementKey})`}
              x={x - 5}
              y={y - 5}
              width={10}
              height={10}
            />
          </g>
        );
      case "fa up":
        return (
          <g>
            <mask id={elementKey}>
              <rect
                x={x - 7.071067812}
                y={y - 14.142135624}
                width={14.142135624}
                height={14.142135624}
                fill="white"
                transform={`rotate(45,${x},${y})`}
              />
            </mask>
            <rect
              mask={`url(#${elementKey})`}
              x={x - 5}
              y={y - 5}
              width={10}
              height={10}
            />
          </g>
        );
      case "inverted triangle":
        return (
          <g transform={`translate(${x},${y})`}>
            <path d="M 2.8764649e-7,3.6661739 -4.2333331,-3.666174 h 8.4666667 z" />
          </g>
        );
      case "la":
        return <rect x={x - 4.5} y={y - 4.5} width={9} height={9} />;
      case "left triangle":
        return (
          <g>
            <mask id={elementKey}>
              <rect
                x={x - 7.071067812}
                y={y - 14.142135624}
                width={14.142135624}
                height={14.142135624}
                fill="white"
                transform={`rotate(135,${x},${y})`}
              />
            </mask>
            <rect
              mask={`url(#${elementKey})`}
              x={x - 5}
              y={y - 5}
              width={10}
              height={10}
            />
          </g>
        );
      case "mi":
        return (
          <rect
            x={x - 3.5355339}
            y={y - 3.5355339}
            width={7.0710678}
            height={7.0710678}
            transform={`rotate(-45,${x},${y})`}
          />
        );
      case "none":
        return <g transform={`translate(${x},${y})`}></g>;
      case "normal":
        if (type) return renderDurationHead();
        return (
          <ellipse
            cx={x}
            cy={y}
            rx={6}
            ry={4}
            transform={`rotate(-27,${x},${y})`}
            fill="black"
          />
        );
      case "re":
        return (
          <g transform={`translate(${x},${y})`}>
            <path d="M -5,-4.4089837 H 5 v 3.81923978 C 5,2.1709774 2.7619932,4.4089842 0.0012719,4.4089842 h -0.00254 C -2.7619932,4.4089842 -5,2.1709774 -5,-0.58974392 Z" />
          </g>
        );
      case "rectangle":
        return (
          <rect
            x={x - 5}
            y={y - 3.090169945}
            width={10}
            height={6.18033989}
            fill="black"
          />
        );
      case "slash":
        return (
          <g>
            <mask id={elementKey}>
              <rect x={x - 4} y={y - 5} width={8} height={10} fill="white" />
            </mask>
            <line
              mask={`url(#${elementKey})`}
              x1={x - 5}
              y1={y + 5}
              x2={x + 5}
              y2={y - 5}
              stroke="black"
              strokeWidth="2"
            />
          </g>
        );
      case "slashed":
        return (
          <g>
            <ellipse
              cx={x}
              cy={y}
              rx={6}
              ry={4}
              transform={`rotate(-27,${x},${y})`}
              fill="black"
            />
            <line
              x1={x + 6}
              y1={y - 6}
              x2={x - 6}
              y2={y + 6}
              stroke="black"
              strokeWidth="1"
            />
          </g>
        );
      case "square":
        return <rect x={x - 4} y={y - 4} width={8} height={8} fill="black" />;
      case "ti":
        return (
          <g transform={`translate(${x},${y})`}>
            <path d="m 5,-1.4644661 0,0 -5,5 -5.0000002,-5.0000002 A 7.071068,7.071068 0 0 1 5,-1.4644661 Z" />
          </g>
        );
      case "triangle":
        return (
          <g transform={`translate(${x},${y})`}>
            <path d="M 4.2333336,3.6661742 H -4.2333331 L 3.8764648e-7,-3.6661743 Z" />
          </g>
        );
      case "x":
        return (
          <g>
            <g>
              <mask id={elementKey}>
                <rect x={x - 4} y={y - 5} width={8} height={10} fill="white" />
              </mask>
              <line
                mask={`url(#${elementKey})`}
                x1={x - 5}
                y1={y + 5}
                x2={x + 5}
                y2={y - 5}
                stroke="black"
              />
              <line
                mask={`url(#${elementKey})`}
                x1={x + 5}
                y1={y + 5}
                x2={x - 5}
                y2={y - 5}
                stroke="black"
              />
            </g>
          </g>
        );

      default:
        // Fallback to standard notehead
        return (
          <ellipse
            cx={x}
            cy={y}
            rx={6}
            ry={4}
            transform={`rotate(-27,${x},${y})`}
            fill="black"
          />
        );
    }
  };

  if (!notehead) {
    return renderDurationHead();
  }

  return renderSpecialNotehead();
};
