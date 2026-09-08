"use client";

import {
  Canvas,
  useFrame,
  useThree,
} from "@react-three/fiber";

import {
  useGLTF,
  useAnimations,
} from "@react-three/drei";

import * as THREE from "three";
import {
  useEffect,
  useRef,
  useState,
} from "react";

/* =========================================================
   RAAKA — THE DIVINE WARRIOR
   STEP 9 — GAMEPLAY ANIMATION SYSTEM
   ========================================================= */

type PlayerState = {
  x: number;
  z: number;
  rotation: number;
};

type ActionRequest = {
  type:
    | "attack"
    | "heavy"
    | "dodge"
    | "divine";
  id: number;
} | null;

/* =========================================================
   CAMERA
   ========================================================= */

function GameCamera({
  player,
  started,
}: {
  player: React.MutableRefObject<PlayerState>;
  started: boolean;
}) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    if (!started) {
      camera.position.x = THREE.MathUtils.lerp(
        camera.position.x,
        0,
        1 - Math.pow(0.001, delta)
      );

      camera.position.y = THREE.MathUtils.lerp(
        camera.position.y,
        4.8,
        1 - Math.pow(0.001, delta)
      );

      camera.position.z = THREE.MathUtils.lerp(
        camera.position.z,
        9,
        1 - Math.pow(0.001, delta)
      );

      camera.lookAt(0, 1.7, 0);
      return;
    }

    const targetX = player.current.x;
    const targetZ = player.current.z + 6.5;

    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      targetX,
      1 - Math.pow(0.0008, delta)
    );

    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      3.4,
      1 - Math.pow(0.0008, delta)
    );

    camera.position.z = THREE.MathUtils.lerp(
      camera.position.z,
      targetZ,
      1 - Math.pow(0.0008, delta)
    );

    camera.lookAt(
      player.current.x,
      1.65,
      player.current.z
    );
  });

  return null;
}

/* =========================================================
   ANIMATION FINDER
   ========================================================= */

function findAnimation(
  animations: THREE.AnimationClip[],
  keywords: string[]
) {
  const normalized = animations.map((clip) => ({
    clip,
    name: clip.name.toLowerCase(),
  }));

  for (const keyword of keywords) {
    const found = normalized.find((item) =>
      item.name.includes(keyword)
    );

    if (found) {
      return found.clip;
    }
  }

  return null;
}

/* =========================================================
   REAL RAAKA CHARACTER
   ========================================================= */

function Warrior({
  player,
  keys,
  actionRequest,
}: {
  player: React.MutableRefObject<PlayerState>;

  keys: React.MutableRefObject<
    Record<string, boolean>
  >;

  actionRequest: ActionRequest;
}) {
  const group = useRef<THREE.Group>(null);

  const currentAction =
    useRef<THREE.AnimationAction | null>(null);

  const lockedAction = useRef(false);

  const previousPosition = useRef({
    x: 0,
    z: 0,
  });

  const { scene, animations } = useGLTF(
    "/game/characters/raaka-warrior-animated.glb"
  );

  const {
    actions,
    mixer,
  } = useAnimations(
    animations,
    group
  );

  /* =======================================================
     CHARACTER SETUP
     ======================================================= */

  useEffect(() => {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;

        const materials = Array.isArray(
          object.material
        )
          ? object.material
          : [object.material];

        materials.forEach((material) => {
          material.needsUpdate = true;
        });
      }
    });

    /* -----------------------------------------------------
       AUTO SCALE
       ----------------------------------------------------- */

    const box = new THREE.Box3().setFromObject(
      scene
    );

    const size = new THREE.Vector3();

    box.getSize(size);

    const targetHeight = 3.6;

    if (size.y > 0) {
      const scale =
        targetHeight / size.y;

      scene.scale.setScalar(scale);
    }

    /* -----------------------------------------------------
       GROUND ALIGNMENT
       ----------------------------------------------------- */

    const scaledBox =
      new THREE.Box3().setFromObject(
        scene
      );

    const scaledCenter =
      new THREE.Vector3();

    scaledBox.getCenter(
      scaledCenter
    );

    scene.position.x -=
      scaledCenter.x;

    scene.position.z -=
      scaledCenter.z;

    scene.position.y -=
      scaledBox.min.y;

    /* -----------------------------------------------------
       DEBUG
       ----------------------------------------------------- */

    console.log(
      "======================================"
    );

    console.log(
      "RAAKA ANIMATED GLB"
    );

    console.log(
      "Animation Count:",
      animations.length
    );

    console.log(
      "Animation Names:",
      animations.map(
        (clip) => clip.name
      )
    );

    console.log(
      "Available Actions:",
      Object.keys(actions)
    );

    console.log(
      "======================================"
    );
  }, [
    scene,
    animations,
    actions,
  ]);

  /* =======================================================
     PLAY ANIMATION
     ======================================================= */

  const playAnimation = (
    clip: THREE.AnimationClip | null,
    loop = false
  ) => {
    if (!clip) {
      console.warn(
        "Requested animation not found."
      );
      return;
    }

    const action =
      actions[clip.name];

    if (!action) {
      console.warn(
        "Action missing:",
        clip.name
      );
      return;
    }

    if (
      currentAction.current ===
      action
    ) {
      return;
    }

    if (
      currentAction.current
    ) {
      action
        .reset()
        .fadeIn(0.18);

      currentAction.current
        .fadeOut(0.18);
    } else {
      action
        .reset()
        .fadeIn(0.18);
    }

    if (loop) {
      action.setLoop(
        THREE.LoopRepeat,
        Infinity
      );

      action.clampWhenFinished = false;
    } else {
      action.setLoop(
        THREE.LoopOnce,
        1
      );

      action.clampWhenFinished = true;
    }

    action.play();

    currentAction.current =
      action;
  };

  /* =======================================================
     COMBAT / SPECIAL ACTION
     ======================================================= */

  useEffect(() => {
    if (!actionRequest) {
      return;
    }

    let keywords: string[] = [];

    if (
      actionRequest.type ===
      "attack"
    ) {
      keywords = [
        "sword attack",
        "attack",
        "slash",
        "strike",
      ];
    }

    if (
      actionRequest.type ===
      "heavy"
    ) {
      keywords = [
        "heavy",
        "power attack",
        "strong attack",
        "great sword",
      ];
    }

    if (
      actionRequest.type ===
      "dodge"
    ) {
      keywords = [
        "dodge",
        "roll",
        "evade",
      ];
    }

    if (
      actionRequest.type ===
      "divine"
    ) {
      keywords = [
        "divine",
        "power",
        "special",
        "magic",
      ];
    }

    const clip =
      findAnimation(
        animations,
        keywords
      );

    if (!clip) {
      console.warn(
        "Animation not found for:",
        actionRequest.type,
        animations.map(
          (item) => item.name
        )
      );

      return;
    }

    lockedAction.current =
      true;

    playAnimation(
      clip,
      false
    );

    const duration =
      clip.duration;

    const timer =
      window.setTimeout(() => {
        lockedAction.current =
          false;

        currentAction.current =
          null;
      }, duration * 1000 + 100);

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    actionRequest,
    animations,
    actions,
  ]);

  /* =======================================================
     FRAME LOOP
     ======================================================= */

  useFrame((_, delta) => {
    if (!group.current) {
      return;
    }

    /* -----------------------------------------------------
       CHARACTER MOVEMENT
       ----------------------------------------------------- */

    group.current.position.x =
      THREE.MathUtils.lerp(
        group.current.position.x,
        player.current.x,
        1 -
          Math.pow(
            0.0005,
            delta
          )
      );

    group.current.position.z =
      THREE.MathUtils.lerp(
        group.current.position.z,
        player.current.z,
        1 -
          Math.pow(
            0.0005,
            delta
          )
      );

    group.current.rotation.y =
      THREE.MathUtils.lerp(
        group.current.rotation.y,
        player.current.rotation,
        1 -
          Math.pow(
            0.0005,
            delta
          )
      );

    /* -----------------------------------------------------
       DETECT MOVEMENT
       ----------------------------------------------------- */

    const dx =
      player.current.x -
      previousPosition.current
        .x;

    const dz =
      player.current.z -
      previousPosition.current
        .z;

    const moving =
      Math.abs(dx) +
        Math.abs(dz) >
      0.0005;

    previousPosition.current.x =
      player.current.x;

    previousPosition.current.z =
      player.current.z;

    /* -----------------------------------------------------
       LOCOMOTION
       ----------------------------------------------------- */

    if (
      !lockedAction.current
    ) {
      if (moving) {
        const running =
          keys.current.shift;

        const clip =
          running
            ? findAnimation(
                animations,
                [
                  "run",
                  "sprint",
                  "jog",
                ]
              )
            : findAnimation(
                animations,
                [
                  "walk",
                  "walking",
                ]
              );

        if (clip) {
          playAnimation(
            clip,
            true
          );
        }
      } else {
        const idle =
          findAnimation(
            animations,
            [
              "idle",
              "stand",
              "breath",
              "default",
            ]
          ) ||
          animations[0] ||
          null;

        if (idle) {
          playAnimation(
            idle,
            true
          );
        }
      }
    }

    /* -----------------------------------------------------
       ANIMATION MIXER
       ----------------------------------------------------- */

    mixer.update(delta);
  });

  return (
    <group ref={group}>
      <primitive
        object={scene}
      />
    </group>
  );
}

useGLTF.preload(
  "/game/characters/raaka-warrior-animated.glb"
);

/* =========================================================
   ARENA
   ========================================================= */

function Arena() {
  return (
    <group>
      {/* GROUND */}

      <mesh
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        receiveShadow
      >
        <planeGeometry
          args={[80, 80]}
        />

        <meshStandardMaterial
          color="#080706"
          metalness={0.35}
          roughness={0.9}
        />
      </mesh>

      {/* ARENA PLATFORM */}

      <mesh
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        position={[
          0,
          0.02,
          0,
        ]}
        receiveShadow
      >
        <circleGeometry
          args={[13, 64]}
        />

        <meshStandardMaterial
          color="#15100b"
          metalness={0.55}
          roughness={0.65}
        />
      </mesh>

      {/* OUTER RING */}

      <mesh
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        position={[
          0,
          0.035,
          0,
        ]}
      >
        <ringGeometry
          args={[
            10.3,
            10.42,
            64,
          ]}
        />

        <meshBasicMaterial
          color="#9b5d1c"
        />
      </mesh>

      {/* INNER RING */}

      <mesh
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        position={[
          0,
          0.04,
          0,
        ]}
      >
        <ringGeometry
          args={[
            7.7,
            7.82,
            64,
          ]}
        />

        <meshBasicMaterial
          color="#c27924"
        />
      </mesh>

      {/* CENTER RING */}

      <mesh
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        position={[
          0,
          0.045,
          0,
        ]}
      >
        <ringGeometry
          args={[
            2.5,
            2.58,
            48,
          ]}
        />

        <meshBasicMaterial
          color="#e09a35"
        />
      </mesh>

      {/* CENTER CORE */}

      <mesh
        position={[
          0,
          0.055,
          0,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
      >
        <circleGeometry
          args={[0.12, 24]}
        />

        <meshBasicMaterial
          color="#ffc65b"
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   PILLAR
   ========================================================= */

function Pillar({
  position,
  scale = 1,
}: {
  position: [
    number,
    number,
    number
  ];
  scale?: number;
}) {
  return (
    <group
      position={position}
      scale={scale}
    >
      <mesh
        position={[
          0,
          0.18,
          0,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            1.2,
            0.35,
            1.2,
          ]}
        />

        <meshStandardMaterial
          color="#30271f"
          metalness={0.35}
          roughness={0.78}
        />
      </mesh>

      <mesh
        position={[
          0,
          2.4,
          0,
        ]}
        castShadow
      >
        <cylinderGeometry
          args={[
            0.4,
            0.52,
            4.5,
            12,
          ]}
        />

        <meshStandardMaterial
          color="#27211b"
          metalness={0.3}
          roughness={0.82}
        />
      </mesh>

      <mesh
        position={[
          0,
          4.72,
          0,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            1.25,
            0.35,
            1.25,
          ]}
        />

        <meshStandardMaterial
          color="#453426"
          metalness={0.42}
          roughness={0.68}
        />
      </mesh>

      <pointLight
        position={[
          0,
          1.3,
          0,
        ]}
        intensity={0.7}
        distance={5}
      />

      <mesh
        position={[
          0,
          1.1,
          0,
        ]}
      >
        <sphereGeometry
          args={[
            0.08,
            12,
            8,
          ]}
        />

        <meshBasicMaterial
          color="#ff8126"
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   MOUNTAINS
   ========================================================= */

function Mountains() {
  const mountains = [
    [-25, 4, -28, 5],
    [-17, 3, -30, 4],
    [-9, 5, -32, 6],
    [0, 4, -34, 5],
    [10, 5, -32, 6],
    [19, 3, -30, 4],
    [27, 4, -27, 5],
    [-30, 3, -5, 4],
    [30, 3, -5, 4],
    [-28, 4, 18, 5],
    [28, 4, 18, 5],
  ];

  return (
    <group>
      {mountains.map(
        (m, index) => (
          <mesh
            key={index}
            position={[
              m[0],
              m[1],
              m[2],
            ]}
            scale={[
              m[3],
              m[3],
              m[3],
            ]}
            rotation={[
              0,
              index * 0.35,
              0,
            ]}
          >
            <coneGeometry
              args={[
                2.8,
                6,
                5,
              ]}
            />

            <meshStandardMaterial
              color="#100f0e"
              roughness={1}
            />
          </mesh>
        )
      )}
    </group>
  );
}

/* =========================================================
   LIGHTING
   ========================================================= */

function Lighting() {
  return (
    <>
      <ambientLight
        intensity={0.32}
      />

      <directionalLight
        position={[
          8,
          14,
          8,
        ]}
        intensity={2}
        castShadow
        shadow-mapSize-width={
          1024
        }
        shadow-mapSize-height={
          1024
        }
        shadow-camera-near={1}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={
          -20
        }
      />

      <pointLight
        position={[
          0,
          5,
          0,
        ]}
        intensity={3}
        distance={20}
      />

      <pointLight
        position={[
          -12,
          3,
          -5,
        ]}
        intensity={2.5}
        distance={15}
      />

      <pointLight
        position={[
          12,
          3,
          -5,
        ]}
        intensity={2.5}
        distance={15}
      />
    </>
  );
}

/* =========================================================
   WORLD
   ========================================================= */

function World({
  player,
  started,
  keys,
  actionRequest,
}: {
  player: React.MutableRefObject<PlayerState>;
  started: boolean;

  keys: React.MutableRefObject<
    Record<string, boolean>
  >;

  actionRequest: ActionRequest;
}) {
  return (
    <>
      <GameCamera
        player={player}
        started={started}
      />

      <Lighting />

      <Arena />

      <Pillar
        position={[
          -10,
          0,
          -10,
        ]}
        scale={1.15}
      />

      <Pillar
        position={[
          10,
          0,
          -10,
        ]}
        scale={1.15}
      />

      <Pillar
        position={[
          -10,
          0,
          10,
        ]}
      />

      <Pillar
        position={[
          10,
          0,
          10,
        ]}
      />

      <Mountains />

      <Warrior
        player={player}
        keys={keys}
        actionRequest={
          actionRequest
        }
      />
    </>
  );
}

/* =========================================================
   MAIN GAME
   ========================================================= */

export default function RaakaGamePage() {
  const player =
    useRef<PlayerState>({
      x: 0,
      z: 0,
      rotation: 0,
    });

  const keys =
    useRef<Record<string, boolean>>(
      {}
    );

  const [started, setStarted] =
    useState(false);

  const [controls, setControls] =
    useState(false);

  const [
    actionRequest,
    setActionRequest,
  ] =
    useState<ActionRequest>(
      null
    );

  const actionId =
    useRef(0);

  /* =======================================================
     ACTION REQUEST
     ======================================================= */

  const triggerAction = (
    type:
      | "attack"
      | "heavy"
      | "dodge"
      | "divine"
  ) => {
    actionId.current += 1;

    setActionRequest({
      type,
      id: actionId.current,
    });
  };

  /* =======================================================
     KEYBOARD
     ======================================================= */

  useEffect(() => {
    const down = (
      event: KeyboardEvent
    ) => {
      keys.current[
        event.key.toLowerCase()
      ] = true;

      if (!started) {
        return;
      }

      if (event.repeat) {
        return;
      }

      const key =
        event.key.toLowerCase();

      if (key === "j") {
        triggerAction(
          "attack"
        );
      }

      if (key === "k") {
        triggerAction(
          "heavy"
        );
      }

      if (key === " ") {
        event.preventDefault();

        triggerAction(
          "divine"
        );
      }
    };

    const up = (
      event: KeyboardEvent
    ) => {
      keys.current[
        event.key.toLowerCase()
      ] = false;
    };

    window.addEventListener(
      "keydown",
      down
    );

    window.addEventListener(
      "keyup",
      up
    );

    return () => {
      window.removeEventListener(
        "keydown",
        down
      );

      window.removeEventListener(
        "keyup",
        up
      );
    };
  }, [started]);

  /* =======================================================
     MOVEMENT
     ======================================================= */

  useEffect(() => {
    let animationFrame = 0;

    const move = () => {
      if (started) {
        const running =
          keys.current.shift;

        const speed =
          running
            ? 0.18
            : 0.11;

        let x = 0;
        let z = 0;

        if (
          keys.current.w ||
          keys.current.arrowup
        ) {
          z -= speed;
        }

        if (
          keys.current.s ||
          keys.current.arrowdown
        ) {
          z += speed;
        }

        if (
          keys.current.a ||
          keys.current.arrowleft
        ) {
          x -= speed;
        }

        if (
          keys.current.d ||
          keys.current.arrowright
        ) {
          x += speed;
        }

        if (
          x !== 0 ||
          z !== 0
        ) {
          player.current.x += x;

          player.current.z += z;

          player.current.x =
            THREE.MathUtils.clamp(
              player.current.x,
              -11,
              11
            );

          player.current.z =
            THREE.MathUtils.clamp(
              player.current.z,
              -11,
              11
            );

          player.current.rotation =
            Math.atan2(x, z);
        }
      }

      animationFrame =
        requestAnimationFrame(
          move
        );
    };

    animationFrame =
      requestAnimationFrame(
        move
      );

    return () => {
      cancelAnimationFrame(
        animationFrame
      );
    };
  }, [started]);

  return (
    <main className="relative h-screen w-full overflow-hidden bg-black text-white">

      {/* ===================================================
          THREE.JS
          =================================================== */}

      <Canvas
        shadows
        dpr={1}
        camera={{
          position: [
            0,
            5.5,
            12,
          ],
          fov: 48,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          powerPreference:
            "high-performance",
          alpha: false,
        }}
      >
        <color
          attach="background"
          args={[
            "#050403",
          ]}
        />

        <fog
          attach="fog"
          args={[
            "#070605",
            18,
            62,
          ]}
        />

        <World
          player={player}
          started={started}
          keys={keys}
          actionRequest={
            actionRequest
          }
        />
      </Canvas>

      {/* ===================================================
          VIGNETTE
          =================================================== */}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(0,0,0,.25)_60%,rgba(0,0,0,.85)_100%)]" />

      {/* ===================================================
          TOP LEFT
          =================================================== */}

      <div className="absolute left-6 top-6 z-20 md:left-9 md:top-8">

        <div className="flex items-center gap-3">

          <span className="h-px w-8 bg-orange-400" />

          <span className="font-mono text-[8px] uppercase tracking-[0.45em] text-orange-200/70">
            WORLD OF RAAKA
          </span>

        </div>

        <h1 className="mt-2 text-xl font-black uppercase tracking-[-0.05em] md:text-2xl">
          THE DIVINE WARRIOR
        </h1>

      </div>

      {/* ===================================================
          TOP RIGHT
          =================================================== */}

      <div className="absolute right-6 top-6 z-20 text-right md:right-9 md:top-8">

        <p className="font-mono text-[7px] uppercase tracking-[0.35em] text-white/30">
          Realm
        </p>

        <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-white/70">
          THE AWAKENING
        </p>

      </div>

      {/* ===================================================
          START SCREEN
          =================================================== */}

      {!started && (
        <div className="absolute inset-x-0 bottom-0 z-30 flex justify-center px-5 pb-9 md:pb-12">

          <div className="w-full max-w-3xl text-center">

            <div className="mb-5 flex items-center justify-center gap-4">

              <span className="h-px w-12 bg-orange-500/70" />

              <span className="font-mono text-[8px] uppercase tracking-[0.4em] text-orange-200/70">
                A NEW LEGEND AWAKENS
              </span>

              <span className="h-px w-12 bg-orange-500/70" />

            </div>

            <h2 className="text-[clamp(4rem,10vw,8rem)] font-black uppercase leading-[0.75] tracking-[-0.09em]">
              RAAKA
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-xs leading-6 text-white/45 md:text-sm">
              Enter the forgotten realm.
              Master the ancient weapons.
              Awaken the power that sleeps within.
            </p>

            <div className="mt-7 flex justify-center gap-3">

              <button
                onClick={() =>
                  setStarted(
                    true
                  )
                }
                className="rounded-full bg-orange-400 px-8 py-3 font-mono text-[9px] font-black uppercase tracking-[0.3em] text-black transition hover:scale-[1.03] hover:bg-orange-300"
              >
                ENTER THE REALM →
              </button>

              <button
                onClick={() =>
                  setControls(
                    true
                  )
                }
                className="rounded-full border border-white/10 bg-black/50 px-7 py-3 font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-white/55 backdrop-blur-xl transition hover:border-white/30 hover:text-white"
              >
                CONTROLS
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          GAME HUD
          =================================================== */}

      {started && (
        <>
          <div className="absolute left-6 top-24 z-20 w-52 md:left-9 md:top-28">

            <div className="mb-1 flex justify-between font-mono text-[7px] uppercase tracking-[0.25em] text-white/40">

              <span>
                LIFE FORCE
              </span>

              <span>
                100
              </span>

            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">

              <div className="h-full w-full bg-gradient-to-r from-red-900 via-red-500 to-orange-300" />

            </div>

            <div className="mb-1 mt-4 flex justify-between font-mono text-[7px] uppercase tracking-[0.25em] text-white/40">

              <span>
                DIVINE ENERGY
              </span>

              <span>
                100
              </span>

            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">

              <div className="h-full w-[78%] bg-gradient-to-r from-orange-800 via-orange-400 to-yellow-100" />

            </div>

          </div>

          <div className="absolute right-6 top-24 z-20 text-right md:right-9 md:top-28">

            <p className="font-mono text-[7px] uppercase tracking-[0.3em] text-white/25">
              CURRENT WEAPON
            </p>

            <p className="mt-1 text-sm font-black text-orange-200">
              ASTRA BLADE
            </p>

            <p className="mt-2 font-mono text-[7px] uppercase tracking-[0.2em] text-white/25">
              WAVE 01
            </p>

          </div>

          <div className="absolute bottom-5 left-1/2 z-20 hidden -translate-x-1/2 gap-2 md:flex">

            <div className="rounded-full border border-white/10 bg-black/60 px-4 py-2 font-mono text-[7px] tracking-[0.2em] text-white/40">
              WASD · MOVE
            </div>

            <div className="rounded-full border border-white/10 bg-black/60 px-4 py-2 font-mono text-[7px] tracking-[0.2em] text-white/40">
              J · ATTACK
            </div>

            <div className="rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 font-mono text-[7px] tracking-[0.2em] text-orange-200/70">
              SPACE · DIVINE
            </div>

          </div>
        </>
      )}

      {/* ===================================================
          CONTROLS
          =================================================== */}

      {controls && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 p-5 backdrop-blur-md">

          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0908] p-7">

            <div className="flex justify-between">

              <div>

                <p className="font-mono text-[7px] uppercase tracking-[0.35em] text-orange-400/70">
                  WARRIOR TRAINING
                </p>

                <h3 className="mt-2 text-2xl font-black uppercase">
                  CONTROLS
                </h3>

              </div>

              <button
                onClick={() =>
                  setControls(
                    false
                  )
                }
                className="h-8 w-8 rounded-full border border-white/10 text-white/50 hover:text-white"
              >
                ×
              </button>

            </div>

            <div className="mt-7 space-y-2">

              <ControlRow
                keys="W A S D"
                action="MOVE"
              />

              <ControlRow
                keys="SHIFT + WASD"
                action="RUN"
              />

              <ControlRow
                keys="MOUSE"
                action="CAMERA"
              />

              <ControlRow
                keys="J"
                action="ATTACK"
              />

              <ControlRow
                keys="K"
                action="HEAVY ATTACK"
              />

              <ControlRow
                keys="SPACE"
                action="DIVINE AVATAR"
              />

              <ControlRow
                keys="SHIFT"
                action="DASH"
              />

            </div>

          </div>
        </div>
      )}

    </main>
  );
}

/* =========================================================
   CONTROL ROW
   ========================================================= */

function ControlRow({
  keys,
  action,
}: {
  keys: string;
  action: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3">

      <span className="text-xs text-white/45">
        {action}
      </span>

      <span className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-orange-200/65">
        {keys}
      </span>

    </div>
  );
}