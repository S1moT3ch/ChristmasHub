import React, { useEffect, useState, useCallback } from "react";
// Aggiungiamo TinyColor per gestire le conversioni facilmente
import tinycolor from "tinycolor2";
import {
    Card, CardContent, Typography, Switch, Slider, Box, Grid, Button, Chip, Stack
} from "@mui/material";
import { HexColorPicker } from "react-colorful";
import { Brightness6, Palette } from "@mui/icons-material";

// ================= CONFIG =================
const ESP_HOST = "https://newipcamera.duckdns.org";
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

    // Caricamento dati
    const load = async () => {
        const data = await apiGet("/api/strips");
        if (Array.isArray(data)) setLeds(data);
    };

    useEffect(() => {
        load();
        const timer = setInterval(load, 5000);
        return () => clearInterval(timer);
    }, []);

    // FUNZIONE CHIAVE: Cambia intensità senza cambiare la tonalità
    const updateIntensity = async (led, brightness) => {
        // Convertiamo l'attuale RGB in HSV
        let color = tinycolor({ r: led.r, g: led.g, b: led.b });
        // Sovrascriviamo il "Value" (luminosità) con lo slider (0-100)
        let newColor = color.toHsv();
        newColor.v = brightness / 100;

        const { r, g, b } = tinycolor(newColor).toRgb();

        updateLedApi(led.id, { r, g, b, on: brightness > 0 });
    };

    const updateLedApi = async (id, update) => {
        // Update locale rapido
        setLeds(prev => prev.map(l => l.id === id ? { ...l, ...update } : l));

        await apiPut(`/api/strips/set?id=${id}`, {
            on: update.on ?? true,
            r: Math.round(update.r),
            g: Math.round(update.g),
            b: Math.round(update.b)
        });
    };

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
        <Box p={4} sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <Typography variant="h3" fontWeight="bold" textAlign="center" gutterBottom>
                Smart Lighting Studio
            </Typography>

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

            <Grid container spacing={4} justifyContent="center">
                {leds.map((led) => {
                    const currentColor = tinycolor({ r: led.r, g: led.g, b: led.b });
                    const brightnessValue = Math.round(currentColor.toHsv().v * 100);

                    return (
                        <Grid item xs={12} md={6} lg={4} key={led.id}>
                            <Card sx={{ borderRadius: 6, overflow: 'visible', position: 'relative' }}>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" mb={2}>
                                        <Typography variant="h6" fontWeight="600">{led.name || `Strip ${led.id}`}</Typography>
                                        <Switch
                                            checked={led.on}
                                            onChange={(e) => updateLedApi(led.id, { on: e.target.checked })}
                                        />
                                    </Stack>

                                    {/* Switch Rainbow Singolo */}
                                    <Box display="flex" alignItems="center" mt={0} justifyContent="space-between">
                                        <Typography variant="body2" sx={{color: 'secondary.main'}}>Effetto Rainbow</Typography>
                                        <Switch
                                            checked={!!led.rainbow} // converte in booleano
                                            color="secondary"
                                            onChange={() => toggleSingleRainbow(led.id, led.rainbow)}
                                        />
                                    </Box>

                                    {/* Palette Colori Avanzata */}
                                    <Box sx={{ '& .react-colorful': { width: '100%', height: '150px' } }}>
                                        <HexColorPicker
                                            color={currentColor.toHexString()}
                                            onChange={(newHex) => {
                                                const { r, g, b } = tinycolor(newHex).toRgb();
                                                updateLedApi(led.id, { r, g, b });
                                            }}
                                        />
                                    </Box>

                                    {/* Slider Intensità (Brightness) */}
                                    <Box mt={3} px={1}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Brightness6 color="action" />
                                            <Typography variant="caption">INTENSITÀ</Typography>
                                        </Stack>
                                        <Slider
                                            value={brightnessValue}
                                            min={0}
                                            max={100}
                                            onChange={(_, v) => updateIntensity(led, v)}
                                            valueLabelDisplay="auto"
                                            sx={{
                                                color: currentColor.toHexString(),
                                                '& .MuiSlider-thumb': { border: '2px solid currentColor', bgcolor: '#fff' }
                                            }}
                                        />
                                    </Box>

                                    {/* Quick Presets / Mix di Colore */}
                                    <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
                                        {['#FF0000', '#00FF00', '#0000FF', '#FFA500', '#FFFFFF'].map(preset => (
                                            <Box
                                                key={preset}
                                                onClick={() => {
                                                    const { r, g, b } = tinycolor(preset).toRgb();
                                                    updateLedApi(led.id, { r, g, b });
                                                }}
                                                sx={{
                                                    width: 24, height: 24, borderRadius: '50%', bgcolor: preset,
                                                    cursor: 'pointer', border: '2px solid #ddd',
                                                    '&:hover': { transform: 'scale(1.2)' }, transition: '0.2s'
                                                }}
                                            />
                                        ))}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}