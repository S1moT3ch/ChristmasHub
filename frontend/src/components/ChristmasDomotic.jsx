import React, { useState } from "react";
import { Button, Card, CardContent, Typography } from "@mui/material";

function ChristmasDomotics() {
    const [socket1, setSocket1] = useState(false);
    const [socket2, setSocket2] = useState(false);

    // Funzione generica per inviare i comandi
    const toggleSocket = async (socketId, currentState, setState) => {
        const newState = !currentState;

        try {
            await fetch(`/api/socket/${socketId}/${newState ? "on" : "off"}`, {
                method: "POST"
            });

            setState(newState);
        } catch (err) {
            console.error("Errore:", err);
        }
    };

    return (
        <div className="container mt-5">
            <Card className="mb-4 text-center">
                <CardContent>
                    <Typography variant="h5" className="mb-3">
                        Christmas Domotics Control Hub
                    </Typography>

                    {/* Presa 1 */}
                    <div className="mb-4">
                        <Typography variant="subtitle1">Presa Vimar 1</Typography>
                        <Button
                            variant="contained"
                            color={socket1 ? "success" : "error"}
                            onClick={() => toggleSocket(1, socket1, setSocket1)}
                        >
                            {socket1 ? "Spegni" : "Accendi"}
                        </Button>
                    </div>

                    {/* Presa 2 */}
                    <div>
                        <Typography variant="subtitle1">Presa Vimar 2</Typography>
                        <Button
                            variant="contained"
                            color={socket2 ? "success" : "error"}
                            onClick={() => toggleSocket(2, socket2, setSocket2)}
                        >
                            {socket2 ? "Spegni" : "Accendi"}
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}

export default ChristmasDomotics;
