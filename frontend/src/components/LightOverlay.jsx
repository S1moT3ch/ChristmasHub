import { Box } from "@mui/material";
import presepeImg from "../images/presepe.png";

const zones = [
    { id: "0", name: "Grotta", top: "20%", left: "60%", width: 220, height: 150, rotate: "50deg" },
    { id: "1", name: "Perimetro", top: "65%", left: "10%", width: 300, height: 30, rotate: "30deg" },
    { id: "2", name: "Viale", top: "60%", left: "35%", width: 150, height: 60, rotate: "30deg" },
];

export default function LightOverlay({ relays, onSelect }) {
    const isOn = (id) => relays.find(r => r.id === id)?.state;

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
            }}
        >
            <Box
                sx={{
                    position: "relative",
                    width: "90vw",
                    height: "70vh",
                    backgroundImage: `url(${presepeImg})`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                }}
            >
                {zones.map(zone => (
                    <Box
                        key={zone.id}
                        onClick={() => onSelect(zone.id)}
                        sx={{
                            position: "absolute",
                            top: zone.top,
                            left: zone.left,
                            width: zone.width,
                            height: zone.height,
                            rotate: zone.rotate,
                            borderRadius: 2,
                            cursor: "pointer",
                            bgcolor: "transparent",
                        }}
                    />
                ))}
            </Box>
        </Box>
    );
}
