import fs from "fs";
import path from "path";

const SETTINGS_FILE = path.join(__dirname, "../../../config/settings.json");

export interface SystemSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  productAlerts: boolean;
}

const defaultSettings: SystemSettings = {
  emailNotifications: true,
  smsNotifications: false,
  productAlerts: true,
};

function ensureFileExists() {
  const dir = path.dirname(SETTINGS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2), "utf-8");
  }
}

export async function getSettings(): Promise<SystemSettings> {
  try {
    ensureFileExists();
    const content = fs.readFileSync(SETTINGS_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading settings file:", error);
    return defaultSettings;
  }
}

export async function updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
  try {
    ensureFileExists();
    const current = await getSettings();
    const updated = { ...current, ...settings };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), "utf-8");
    return updated;
  } catch (error) {
    console.error("Error updating settings file:", error);
    throw new Error("Failed to save settings");
  }
}
