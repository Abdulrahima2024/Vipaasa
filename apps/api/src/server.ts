import app from "./app";

const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`[API SERVER] Running at http://localhost:${PORT}`);
});
