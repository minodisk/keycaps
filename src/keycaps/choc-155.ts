import { primitives } from "@jscad/modeling";
import { Vec3 } from "@jscad/modeling/src/maths/vec3";
import { subtract, union } from "@jscad/modeling/src/operations/booleans";
import { hull } from "@jscad/modeling/src/operations/hulls";
import {
  translate,
  translateX,
  translateZ,
} from "@jscad/modeling/src/operations/transforms";
import { cuboid, cylinder, sphere } from "@jscad/modeling/src/primitives";

export default function choc155({
  topDimple = 1,
  topThickness = 1.5,
  topEdge = 2,
  topSize = 12,
  topRadius = 3,
  bottomSize = 15.5,
  bottomRadius = 1,
  bottomInner = 14.5,
  legWidth = 1.1,
  legDepth = 2.5,
  legHeight = 2.6,
  legsGap = 4.6,
  frustumHeight = 0.4,
  frustumWidth = 0.3,
  frustumDepth = 1.7,
}: {
  topDimple?: number;
  topThickness?: number;
  topEdge?: number;
  topSize?: number;
  topRadius?: number;
  bottomSize?: number;
  bottomRadius?: number;
  bottomInner?: number;
  legWidth?: number;
  legDepth?: number;
  legHeight?: number;
  legsGap?: number;
  frustumHeight?: number;
  frustumWidth?: number;
  frustumDepth?: number;
}) {
  return union(
    top({
      topDimple,
      topThickness,
      topEdge,
      topSize,
      topRadius,
      bottomSize,
      bottomRadius,
      bottomInner,
    }),
    translateZ(
      topEdge,
      legs({
        legWidth,
        legDepth,
        legHeight,
        legsGap,
        frustumHeight,
        frustumWidth,
        frustumDepth,
      })
    )
  );
}

function top({
  topDimple,
  topThickness,
  topEdge,
  topSize,
  topRadius,
  bottomSize,
  bottomRadius,
  bottomInner,
}: {
  topDimple: number;
  topThickness: number;
  topEdge: number;
  topSize: number;
  topRadius: number;
  bottomSize: number;
  bottomRadius: number;
  bottomInner: number;
}) {
  const topHeight = topDimple + topThickness + topEdge;
  return subtract(
    hull(
      translateZ(
        topHeight,
        roundedCuboid({
          center: [0, 0, -0.01],
          size: [topSize, topSize, 0.02],
          radius: topRadius,
        })
      ),
      translateZ(
        topEdge,
        roundedCuboid({
          center: [0, 0, 0.01],
          size: [bottomSize, bottomSize, 0.02],
          radius: bottomRadius,
        })
      ),
      roundedCuboid({
        center: [0, 0, 0.01],
        size: [bottomSize, bottomSize, 0.02],
        radius: bottomRadius,
      })
    ),
    hull(
      translateZ(
        topEdge,
        roundedCuboid({
          center: [0, 0, -0.01],
          size: [bottomInner, bottomInner, 0.02],
          radius: 0.1,
        })
      ),
      roundedCuboid({
        center: [0, 0, 0.01],
        size: [bottomInner, bottomInner, 0.02],
        radius: 0.1,
      })
    ),
    translateZ(topHeight, dimple(topSize, topDimple))
  );
}

function dimple(size: number, dimple: number) {
  const radius = calcDimpleRadius(size, dimple);
  return translateZ(radius - dimple, sphere({ radius }));
}

function calcDimpleRadius(size: number, depth: number) {
  const s = size * Math.SQRT2;
  return (s * s + 4 * depth * depth) / (8 * depth);
}

function roundedCuboid({
  center = [0, 0, 0],
  size,
  radius,
}: {
  center?: Vec3;
  size: Vec3;
  radius: number;
}) {
  const [sx, sy, sz] = size;
  const circ = cylinder({ radius, height: sz });
  const cx = sx / 2 - radius;
  const cy = sy / 2 - radius;
  return translate(
    center,
    hull(
      cuboid({
        size: [sx - radius * 2, sy - radius * 2, sz],
      }),
      translate([cx, cy, 0], circ),
      translate([-cx, cy, 0], circ),
      translate([cx, -cy, 0], circ),
      translate([-cx, -cy, 0], circ)
    )
  );
}

function legs({
  legWidth,
  legDepth,
  legHeight,
  legsGap,
  frustumHeight,
  frustumWidth,
  frustumDepth,
}: {
  legWidth: number;
  legDepth: number;
  legHeight: number;
  legsGap: number;
  frustumHeight: number;
  frustumWidth: number;
  frustumDepth: number;
}) {
  const gap = (legsGap + legWidth) / 2;
  const l = leg({
    legWidth,
    legDepth,
    legHeight,
    frustumHeight,
    frustumWidth,
    frustumDepth,
  });
  return union(translateX(gap, l), translateX(-gap, l));
}

function leg({
  legWidth,
  legDepth,
  legHeight,
  frustumHeight,
  frustumWidth,
  frustumDepth,
}: {
  legWidth: number;
  legDepth: number;
  legHeight: number;
  frustumHeight: number;
  frustumWidth: number;
  frustumDepth: number;
}) {
  return union(
    translateZ(
      -legHeight / 2,
      primitives.cuboid({
        size: [legWidth, legDepth, legHeight],
      })
    ),
    translateZ(
      -legHeight,
      hull(
        cuboid({
          center: [0, 0, -0.01],
          size: [legWidth, legDepth, 0.02],
        }),
        translateZ(
          -frustumHeight,
          cuboid({
            center: [0, 0, 0.01],
            size: [frustumWidth, frustumDepth, 0.02],
          })
        )
      )
    )
  );
}
