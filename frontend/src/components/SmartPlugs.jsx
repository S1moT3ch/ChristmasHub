import React, { useEffect, useState } from "react";

// Configura l'IP del tuo ESP32 e le credenziali Basic Auth
const ESP32_IP = "newipcamera.duckdns.org:32082";
const USER = "admin";
const PASS = "esp32Backend!25";

// Helper per creare header Basic Auth
const authHeader = "Basic " + btoa(`${USER}:${PASS}`);

const SmartPlugs = () => {
    const [relays, setRelays] = useState([]);
    const [loading, setLoading] = useState(true);

    // Funzione per caricare lo stato dei relè
    const fetchRelays = async () => {
        try {
            const res = await fetch(`http://${ESP32_IP}/api/prese`, {
                headers: {
                    "Authorization": authHeader,
                },
            });
            const data = await res.json();
            setRelays(data);
        } catch (err) {
            console.error("Errore caricamento prese:", err);
        } finally {
            setLoading(false);
        }
    };

    // Funzione per cambiare stato di un relè
    const toggleRelay = async (id, newState) => {
        try {
            await fetch(`http://${ESP32_IP}/api/prese/set?id=${id}`, {
                method: "PUT",
                headers: {
                    "Authorization": authHeader,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ state: newState }),
            });
            // Aggiorna lo stato locale dopo comando
            setRelays((prev) =>
                prev.map((r) => (r.id === id ? { ...r, state: newState } : r))
            );
        } catch (err) {
            console.error("Errore aggiornamento relè:", err);
        }
    };

    useEffect(() => {
        fetchRelays();
        // Aggiorna ogni 5 secondi
        const interval = setInterval(fetchRelays, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div>Caricamento prese...</div>;

    return (
        <div style={{ textAlign: "center" }}>
            <h1>Controllo Smart Plugs</h1>
            {relays.map((relay) => (
                <div key={relay.id} style={{ margin: "10px" }}>
          <span style={{ fontSize: "18px", marginRight: "10px" }}>
            {relay.name} — Stato:{" "}
              <b style={{ color: relay.state ? "green" : "red" }}>
              {relay.state ? "ON" : "OFF"}
            </b>
          </span>
                    <button
                        onClick={() => toggleRelay(relay.id, true)}
                        style={{ marginRight: "5px", padding: "10px" }}
                    >
                        Accendi
                    </button>
                    <button
                        onClick={() => toggleRelay(relay.id, false)}
                        style={{ padding: "10px" }}
                    >
                        Spegni
                    </button>
                </div>
            ))}
        </div>
    );
};

export default SmartPlugs;
