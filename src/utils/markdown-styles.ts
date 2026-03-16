import { StyleSheet, Platform } from "react-native";

export const markdownStyles = StyleSheet.create({
  body: {
    color: "#1A1A1A",
    fontSize: 16,
    lineHeight: 24,
  },
  heading1: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  heading2: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
  },
  heading3: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
  },
  code_inline: {
    backgroundColor: "#F0F0F0",
    color: "#1A1A1A",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontSize: 13,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fence: {
    backgroundColor: "#1E1E1E",
    color: "#D4D4D4",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontSize: 13,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  table: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 4,
  },
  tr: {
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  th: {
    padding: 8,
    fontWeight: "600",
    backgroundColor: "#F7F7F8",
  },
  td: {
    padding: 8,
  },
  link: {
    color: "#0084FF",
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: "#E5E7EB",
    paddingLeft: 12,
    marginLeft: 0,
    color: "#6B7280",
  },
  list_item: {
    marginBottom: 4,
  },
  bullet_list: {
    marginVertical: 8,
  },
  ordered_list: {
    marginVertical: 8,
  },
  image: {
    borderRadius: 8,
  },
  strong: {
    fontWeight: "700",
  },
  em: {
    fontStyle: "italic",
  },
});
