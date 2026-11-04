import Svg, { Circle, Path } from "react-native-svg"
import { colors } from "../theme"

export default function Pet({ small = false }: { small?: boolean }) {
  const width = small ? 115 : 236
  const height = small ? 105 : 218

  return (
    <Svg
      accessibilityLabel="Tasqi, your digital pet"
      height={height}
      style={{ overflow: "visible" }}
      viewBox="0 0 260 240"
      width={width}
    >
      <Path
        d="M59 205c28-15 118-17 148 0 15 9 7 22-18 27-39 8-106 4-128-6-13-6-14-14-2-21Z"
        fill="rgba(39,36,61,0.11)"
      />
      <Path
        d="M77 78C53 67 44 43 56 25c4-6 10-4 12 3l10 27 16-19c5-6 11-3 11 5 0 17-10 31-28 37Z"
        fill="#9189e4"
        stroke={colors.ink}
        strokeLinejoin="round"
        strokeWidth={5}
      />
      <Path
        d="M184 78c24-11 33-35 21-53-4-6-10-4-12 3l-10 27-16-19c-5-6-11-3-11 5 0 17 10 31 28 37Z"
        fill="#9189e4"
        stroke={colors.ink}
        strokeLinejoin="round"
        strokeWidth={5}
      />
      <Path
        d="M130 53c51 0 85 37 85 88 0 53-28 79-85 79s-85-26-85-79c0-51 34-88 85-88Z"
        fill="#9189e4"
        stroke={colors.ink}
        strokeLinejoin="round"
        strokeWidth={5}
      />
      <Path d="M79 157c20 29 83 38 108 0 1 39-21 57-57 57-35 0-53-18-51-57Z" fill="#aca5ef" />
      <Circle cx={96} cy={126} fill={colors.ink} r={7} />
      <Circle cx={164} cy={126} fill={colors.ink} r={7} />
      <Path
        d="M119 143c7 6 15 6 22 0"
        fill="none"
        stroke={colors.ink}
        strokeLinecap="round"
        strokeWidth={5}
      />
      <Circle cx={78} cy={145} fill="#ef8b91" opacity={0.75} r={10} />
      <Circle cx={182} cy={145} fill="#ef8b91" opacity={0.75} r={10} />
    </Svg>
  )
}
