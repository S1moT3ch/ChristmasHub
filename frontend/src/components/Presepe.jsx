import { Box, Typography } from "@mui/material";
import { useState } from "react";
import SmartPlugs from "./SmartPlugs";
import LightOverlay from "./LightOverlay";
import LightDrawer from "./LightDrawer";

export default function Presepe() {
    const [selectedLight, setSelectedLight] = useState(null);

    return (
        <Box sx={{ position: "relative", height: "100vh" }}>
            <Typography variant="h5" sx={{ p: 2 }}>
                Presepe – Stato luci
            </Typography>

            <SmartPlugs>
                {(relays, toggleRelay) => (
                    <>
                        <LightOverlay
                            relays={relays}
                            onSelect={setSelectedLight}
                        />
                        <LightDrawer
                            light={selectedLight}
                            relays={relays}
                            toggleRelay={toggleRelay}
                            onClose={() => setSelectedLight(null)}
                        />
                    </>
                )}
            </SmartPlugs>
        </Box>
    );
}
