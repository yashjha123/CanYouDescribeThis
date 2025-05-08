import React from "react";

import noiseTexture from "../../../public/noise.svg";
const SpinningBackground = () => {
  const Ball = ({ color, index }: { color: string; index: number }) => {
    return (
      <div
        className={`absolute`}
        style={{
          left: "50vw",
          top: "50vh",
          transform: "translate(-50%, -50%)",
          // transform: "translate(-100px, -100px)",
        }}
      >
        <div className="mary-go-round">
          <div style={{ rotate: `${(index * 360) / 3}deg` }}>
            <div
              className="ball"
              style={{
                filter: "blur(60px)",
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                backgroundColor: color,
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="top-0 left-0 backdrop-blur-sm"
      style={{'position':"fixed", "overflow":"hidden", "width": "100vw", "height": "100vh"}}
    >
      <Ball color={"#03A791"} index={1} />
      <Ball color={"#E9A319 "} index={2} />
      <Ball color={"#547792"} index={3} />
      <div
        className="absolute top-0 left-0"
        style={{
          backgroundImage: `url(${noiseTexture.src})`,
          backgroundRepeat: "repeat",
          backgroundSize: "300px 300px",
          width: "100%",
          height: "100%",
        }}
      ></div>
    </div>
  );
};

export default SpinningBackground;
