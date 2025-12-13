import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    Switch,
    Slider,
    Box,
    Grid,
    Button,
    Chip
} from "@mui/material";
import { HexColorPicker } from "react-colorful";

// ================= CONFIG =================
const ESP_HOST = "http://newipcamera.duckdns.org:32082";
const USER = "admin";
const PASS = "esp32Backend!25";

const authHeader = "Basic " + btoa(`${USER}:${PASS}`);

// ================= API HELPERS =================
async function apiGet(path) {
    try {
        const res = await fetch(`${ESP_HOST}${path}`, {
            headers: { Authorization: authHeader },
        });
        return await res.json();
    } catch (e) {
        console.error("API Error:", e);
        return [];
    }
}

async function apiPut(path, body) {
    try {
        await fetch(`${ESP_HOST}${path}`, {
            method: "PUT",
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
    } catch (e) {
        console.error("API Put Error:", e);
    }
}

// AGGIORNATO: Ora accetta un body opzionale per passare {id: ...}
async function apiPost(path, body = {}) {
    try {
        await fetch(`${ESP_HOST}${path}`, {
            method: "POST",
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body),
        });
    } catch (e) {
        console.error("API Post Error:", e);
    }
}

// ================= COMPONENT =================
export default function LedController() {
    const [leds, setLeds] = useState([]);
    const [globalColor, setGlobalColor] = useState("#ffffff");

    const load = async () => {
        const data = await apiGet("/api/strips");
        // Il backend restituisce array vuoto o dati validi
        if (Array.isArray(data)) {
            setLeds(data);
        }
    };

    useEffect(() => {
        load();
        const timer = setInterval(load, 3000); // Sync ogni 3 secondi
        return () => clearInterval(timer);
    }, []);

    // Aggiorna colore/stato singolo LED
    const updateLed = async (id, update) => {
        // Aggiornamento ottimistico UI
        const newLeds = leds.map((l) =>
            l.id === id ? { ...l, ...update } : l
        );
        setLeds(newLeds);

        // Chiamata API
        const payload = newLeds.find(l => l.id === id);

        // Se stiamo cambiando colore o ON/OFF, usiamo apiPut
        // Nota: Il backend disattiva automaticamente il rainbow se riceve un comando colore
        await apiPut(`/api/strips/set?id=${id}`, {
            on: payload.on,
            r: payload.r,
            g: payload.g,
            b: payload.b
        });

        // Se stavi aggiornando 'rainbow' specificamente via switch singolo (gestito a parte sotto)
    };

    // --- FUNZIONI RAINBOW AGGIORNATE ---

    // Attiva Rainbow su TUTTE le strisce
    const startRainbowGlobal = async () => {
        const promises = leds.map(led =>
            apiPost("/api/strips/rainbow", { id: led.id })
        );
        await Promise.all(promises);
        load(); // Ricarica stato reale dal backend
    };

    // Ferma Rainbow su TUTTE le strisce
    const stopRainbowGlobal = async () => {
        const promises = leds.map(led =>
            apiPost("/api/strips/rainbow/stop", { id: led.id })
        );
        await Promise.all(promises);
        load();
    };

    // Attiva/Disattiva Rainbow su SINGOLA striscia
    const toggleSingleRainbow = async (id, isActive) => {
        // Aggiornamento ottimistico
        setLeds(leds.map(l => l.id === id ? { ...l, rainbow: !isActive } : l));

        if (!isActive) {
            await apiPost("/api/strips/rainbow", { id });
        } else {
            await apiPost("/api/strips/rainbow/stop", { id });
        }
        // Piccola pausa per lasciare che l'ESP processi
        setTimeout(load, 200);
    };

    const setAllColor = async (hex) => {
        const { r, g, b } = hexToRgb(hex);
        setGlobalColor(hex);

        // Invia richieste parallele per velocità
        const promises = leds.map(led =>
            apiPut(`/api/strips/set?id=${led.id}`, { on: true, r, g, b })
        );
        await Promise.all(promises);
        load();
    };

    // ================= UTIL =================
    const hexToRgb = (hex) => {
        const bigint = parseInt(hex.replace("#", ""), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return { r, g, b };
    };

    return (
        <Box p={2}>
            <Box mb={4} display="flex" flexDirection="column" alignItems="center" gap={2}>
                <Typography variant="h4" gutterBottom>Controller Luci</Typography>

                <Box display="flex" gap={2}>
                    <Button variant="contained" color="secondary" onClick={startRainbowGlobal}>
                        Rainbow TUTTI
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={stopRainbowGlobal}>
                        Stop TUTTI
                    </Button>
                </Box>

                <Box mt={2}>
                    <HexColorPicker color={globalColor} onChange={setAllColor} />
                </Box>
            </Box>

            <Grid container spacing={3}>
                {leds.map((led) => (
                    <Grid item xs={12} md={6} lg={4} key={led.id}>
                        <Card sx={{
                            borderRadius: 4,
                            boxShadow: 3,
                            border: led.rainbow ? "2px solid #ff00cc" : "none" // Evidenzia se rainbow attivo
                        }}>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6">{led.name || `Striscia ${led.id + 1}`}</Typography>
                                    {led.rainbow && <Chip label="Rainbow Active" color="secondary" size="small" />}
                                </Box>

                                {/* Switch ON/OFF Striscia */}
                                <Box display="flex" alignItems="center" mt={1} justifyContent="space-between">
                                    <Typography variant="body2">Power</Typography>
                                    <Switch
                                        checked={led.on}
                                        disabled={led.rainbow} // Disabilita power switch se in rainbow mode (opzionale)
                                        onChange={(e) => updateLed(led.id, { on: e.target.checked })}
                                    />
                                </Box>

                                {/* Switch Rainbow Singolo */}
                                <Box display="flex" alignItems="center" mt={0} justifyContent="space-between">
                                    <Typography variant="body2" sx={{color: 'secondary.main'}}>Effetto Rainbow</Typography>
                                    <Switch
                                        checked={!!led.rainbow} // converte in booleano
                                        color="secondary"
                                        onChange={() => toggleSingleRainbow(led.id, led.rainbow)}
                                    />
                                </Box>

                                {/* Slider RGB (Disabilitati se Rainbow è attivo per evitare confusione) */}
                                <Box opacity={led.rainbow ? 0.4 : 1} pointerEvents={led.rainbow ? 'none' : 'auto'}>
                                    {["r", "g", "b"].map((c) => (
                                        <Box key={c} mt={1}>
                                            <Grid container alignItems="center" spacing={1}>
                                                <Grid item xs={2}>
                                                    <Typography variant="caption">{c.toUpperCase()}</Typography>
                                                </Grid>
                                                <Grid item xs={10}>
                                                    <Slider
                                                        size="small"
                                                        value={led[c]}
                                                        min={0}
                                                        max={255}
                                                        onChangeCommitted={(_, v) => updateLed(led.id, { [c]: v, on: true })}
                                                        // onChangeCommitted è meglio di onChange per non floodare l'ESP32 mentre trascini
                                                        defaultValue={led[c]}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    ))}
                                </Box>

                                {/* Anteprima Colore */}
                                <Box
                                    mt={2}
                                    height={30}
                                    borderRadius={2}
                                    sx={{
                                        background: led.rainbow
                                            ? "linear-gradient(90deg, red, yellow, green, blue, purple)"
                                            : `rgb(${led.r},${led.g},${led.b})`,
                                        opacity: (led.on || led.rainbow) ? 1 : 0.2,
                                        border: "1px solid #ccc"
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}