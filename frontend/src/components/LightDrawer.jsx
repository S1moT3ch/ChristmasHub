import {
    Drawer,
    Box,
    Typography,
    Switch,
    Stack,
} from "@mui/material";

export default function LightDrawer({
                                        light,
                                        relays,
                                        toggleRelay,
                                        onClose,
                                    }) {
    if (!light) return null;

    const relay = relays.find(r => r.id === parseInt(light, 10));
    console.log("relay", relays);

    return (
        <Drawer anchor="right" open={Boolean(light)} onClose={onClose}>
            <Box sx={{ width: 280, p: 2 }}>
                <Typography variant="h6">
                    Luce: {light}
                </Typography>

                <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
                    <Typography>Spento</Typography>
                    <Switch
                        checked={relay?.state}
                        onChange={(e) =>
                            toggleRelay(light, e.target.checked)
                        }
                    />
                    <Typography>Acceso</Typography>
                </Stack>
            </Box>
        </Drawer>
    );
}
