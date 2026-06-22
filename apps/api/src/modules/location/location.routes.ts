import { Router, Request, Response } from "express";

const router = Router();

router.post("/location", (req: Request, res: Response) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: "Latitude and longitude are required" });
  }

  // Calculate mock ETA based on coordinates distance or simply random for demo
  // In a real app, this would use Google Maps Distance Matrix API or similar
  
  const baseMinutes = 20;
  const randomFactor = Math.floor(Math.random() * 15); // 0 to 14
  const minEta = baseMinutes + randomFactor;
  const maxEta = minEta + 10;

  const etaString = `${minEta}–${maxEta} mins`;

  return res.status(200).json({
    success: true,
    message: "Location received",
    eta: etaString,
    coordinates: { latitude, longitude }
  });
});

export default router;
