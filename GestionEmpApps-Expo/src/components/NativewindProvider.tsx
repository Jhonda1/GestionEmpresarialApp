import { NativeWindStyleSheet } from "nativewind";
import { ReactNode, useEffect } from "react";
import { Platform } from "react-native";

export function NativewindProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (Platform.OS !== "web" && NativeWindStyleSheet?.setOutput) {
      NativeWindStyleSheet.setOutput({
        default: "native"
      });
    }
  }, []);
  return <>{children}</>;
}
