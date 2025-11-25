import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useChatStore = create<ChatState>()(persist());
