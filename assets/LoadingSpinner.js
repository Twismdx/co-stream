import * as React from "react"
import Svg, { Rect } from "react-native-svg"
/* SVGR has dropped some elements not supported by react-native-svg: animate */
const LoadingSpinner = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid"
    style={{
      shapeRendering: "auto",
      display: "block",
      background: "0 0",
    }}
    viewBox="0 0 100 100"
    {...props}
  >
    <Rect
      width={4}
      height={13}
      x={48}
      y={20.5}
      fill="#904cf2"
      rx={1.56}
      ry={1.56}
    ></Rect>
    <Rect
      width={4}
      height={13}
      x={48}
      y={20.5}
      fill="#904cf2"
      rx={1.56}
      ry={1.56}
      transform="rotate(24 50 50)"
    ></Rect>
    <Rect
      width={4}
      height={13}
      x={48}
      y={20.5}
      fill="#904cf2"
      rx={1.56}
      ry={1.56}
      transform="rotate(48 50 50)"
    ></Rect>
    <Rect
      width={4}
      height={13}
      x={48}
      y={20.5}
      fill="#904cf2"
      rx={1.56}
      ry={1.56}
      transform="rotate(72 50 50)"
    ></Rect>
    <Rect
      width={4}
      height={13}
      x={48}
      y={20.5}
      fill="#904cf2"
      rx={1.56}
      ry={1.56}
      transform="rotate(96 50 50)"
    ></Rect>
    <Rect
      width={4}
      height={13}
      x={48}
      y={20.5}
      fill="#904cf2"
      rx={1.56}
      ry={1.56}
      transform="rotate(120 50 50)"
    ></Rect>
    <Rect
      width={4}
      height={13}
      x={48}
      y={20.5}
      fill="#904cf2"
      rx={1.56}
      ry={1.56}
      transform="rotate(144 50 50)"
    ></Rect>
    <Rect
      width={4}
      height={13}
      x={48}
      y={20.5}
      fill="#904cf2"
      rx={1.56}
      ry={1.56}
      transform="rotate(168 50 50)"
    ></Rect>
    <Rect
      width={4}
      height={13}
      x={48}
      y={20.5}
      fill="#904cf2"
      rx={1.56}
      ry={1.56}
      transform="rotate(192 50 50)"
    ></Rect>
    <Rect
      width={4}
      height={13}
      x={48}
      y={20.5}
      fill="#904cf2"
      rx={1.56}
      ry={1.56}
      transform="rotate(216 50 50)"
    ></Rect>
    <Rect
      width={4}
      height={13}
      x={48}
      y={20.5}
      fill="#904cf2"
      rx={1.56}
      ry={1.56}
      transform="rotate(240 50 50)"
    ></Rect>
    <Rect
      width={4}
      height={13}
      x={48}
      y={20.5}
      fill="#904cf2"
      rx={1.56}
      ry={1.56}
      transform="rotate(264 50 50)"
    ></Rect>
    <Rect
      width={4}
      height={13}
      x={48}
      y={20.5}
      fill="#904cf2"
      rx={1.56}
      ry={1.56}
      transform="rotate(288 50 50)"
    ></Rect>
    <Rect
      width={4}
      height={13}
      x={48}
      y={20.5}
      fill="#904cf2"
      rx={1.56}
      ry={1.56}
      transform="rotate(312 50 50)"
    ></Rect>
    <Rect
      width={4}
      height={13}
      x={48}
      y={20.5}
      fill="#904cf2"
      rx={1.56}
      ry={1.56}
      transform="rotate(336 50 50)"
    ></Rect>
  </Svg>
)
export default LoadingSpinner
