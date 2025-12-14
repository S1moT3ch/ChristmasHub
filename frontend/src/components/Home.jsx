import { Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();

    return (
        <Container sx={{ mt: 4, textAlign: "center" }}>
            <Typography variant="h4" gutterBottom>
                Controllo Presepe Natalizio 🎄
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/advanced")}
            >
                Vai al presepe
            </Button>
        </Container>
    );
}
