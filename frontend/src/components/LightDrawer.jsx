import {
    Drawer,
    Box,
    Typography,
    Switch,
    Stack, Chip, ToggleButton,
} from "@mui/material";
import {useState} from "react";

export default function LightDrawer({
                                        light,
                                        relays,
                                        toggleRelay,
                                        onClose,
                                    }) {

    const [isOn, setIsOn] = useState(false);
    if (!light) return null;

    const relayNames = {
        0: "Grotta",
        1: "Perimetro",
        2: "Viale",
    }

    const relay = relays.find(r => r.id === parseInt(light, 10));
    console.log("relay", relays);

    return (
        <Drawer anchor="right" open={Boolean(light)} onClose={onClose} sx>
            <Box sx={{ width: 280, p: 2 }}>
                <Typography variant="h6">
                    Luce: {relayNames[relay.id] ?? `ID ${relay.id}`}
                </Typography>

                <Stack direction="column" spacing={2} alignItems="center" sx={{ mt: 2 }}>
                    <Chip
                        sx={{
                            width: "3rem",
                            height: "3rem",
                            borderRadius: "50%",
                        }}
                        label={relay?.state ? "1" : "0"}
                        color={relay?.state ? "success" : "warning"}
                        size="small"
                    />

                    <Box>
                        <ToggleButton
                            value="check"
                            onChange={() => {
                                const newState = !isOn;
                                setIsOn(newState);
                                toggleRelay(light, false);
                            }}
                            sx={{
                                width: "3rem",
                                height: "3rem",
                                fontWeight: "bold",
                                color: "white",
                                border: "2px solid black",
                                backgroundColor: "red",
                            }}
                        >
                            O
                        </ToggleButton>
                        <ToggleButton
                            value="check"
                            onChange={() => {
                                const newState = !isOn;
                                setIsOn(newState);
                                toggleRelay(light, true);
                            }}
                            sx={{
                                width: "3rem",
                                height: "3rem",
                                fontWeight: "bold",
                                color: "white",
                                border: "2px solid black",
                                backgroundColor: "green",
                            }}
                        >
                            I
                        </ToggleButton>
                    </Box>
                </Stack>
            </Box>
        </Drawer>
    );
}
