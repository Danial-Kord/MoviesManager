package com.company.metadata;

/**
 * Minimal JSON field extraction (no third-party library) for TMDb responses.
 */
final class JsonExtract {
    private JsonExtract() {
    }

    static String firstObjectAfter(String json, int fromIndex) {
        int i = json.indexOf('{', fromIndex);
        if (i < 0) {
            return null;
        }
        int depth = 0;
        for (int j = i; j < json.length(); j++) {
            char c = json.charAt(j);
            if (c == '{') {
                depth++;
            } else if (c == '}') {
                depth--;
                if (depth == 0) {
                    return json.substring(i, j + 1);
                }
            }
        }
        return null;
    }

    static int firstIdInResults(String searchJson) {
        int results = searchJson.indexOf("\"results\"");
        if (results < 0) {
            return -1;
        }
        int arr = searchJson.indexOf('[', results);
        if (arr < 0) {
            return -1;
        }
        int arrEnd = searchJson.indexOf(']', arr);
        if (arrEnd < 0) {
            return -1;
        }
        String inResults = searchJson.substring(arr, arrEnd + 1);
        if (inResults.trim().equals("[]")) {
            return -1;
        }
        int k = inResults.indexOf("\"id\":");
        if (k < 0) {
            return -1;
        }
        return parseIntAfterKey(inResults, k, "\"id\":");
    }

    private static int parseIntAfterKey(String json, int hint, String key) {
        int k = json.indexOf(key, hint);
        if (k < 0) {
            return -1;
        }
        int i = k + key.length();
        while (i < json.length() && Character.isWhitespace(json.charAt(i))) {
            i++;
        }
        int end = i;
        if (i < json.length() && json.charAt(i) == '"') {
            return -1;
        }
        while (end < json.length() && (Character.isDigit(json.charAt(end)) || json.charAt(end) == '-')) {
            end++;
        }
        if (end == i) {
            return -1;
        }
        try {
            return Integer.parseInt(json.substring(i, end));
        } catch (NumberFormatException e) {
            return -1;
        }
    }

    static String stringValue(String json, String key) {
        String pattern = "\"" + key + "\":";
        int p = 0;
        while (p < json.length()) {
            int k = json.indexOf(pattern, p);
            if (k < 0) {
                return null;
            }
            int v = k + pattern.length();
            while (v < json.length() && Character.isWhitespace(json.charAt(v))) {
                v++;
            }
            if (v < json.length() && json.charAt(v) == '"') {
                v++;
                int end = v;
                while (end < json.length()) {
                    if (json.charAt(end) == '\\' && end + 1 < json.length()) {
                        end += 2;
                        continue;
                    }
                    if (json.charAt(end) == '"') {
                        return unescape(json.substring(v, end));
                    }
                    end++;
                }
                return null;
            }
            if (v < json.length() && json.charAt(v) == 'n' && json.regionMatches(v, "null", 0, 4)) {
                return null;
            }
            p = k + 1;
        }
        return null;
    }

    static String numberOrString(String json, String key) {
        String pattern = "\"" + key + "\":";
        int k = json.indexOf(pattern);
        if (k < 0) {
            return null;
        }
        int v = k + pattern.length();
        while (v < json.length() && Character.isWhitespace(json.charAt(v))) {
            v++;
        }
        if (v < json.length() && json.charAt(v) == '"') {
            return stringValue(json, key);
        }
        int end = v;
        while (end < json.length() && (Character.isDigit(json.charAt(end)) || json.charAt(end) == '.' || json.charAt(end) == '-')) {
            end++;
        }
        if (end == v) {
            return null;
        }
        return json.substring(v, end);
    }

    private static String unescape(String s) {
        return s.replace("\\\"", "\"").replace("\\\\", "\\");
    }
}
