package com.fintrack.exception;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.Instant;

public record ApiError(
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        Instant timestamp,
        int status,
        String error,
        String message,
        String path
) {
    public static ApiError of(int status, String error, String message, String path) {
        return new ApiError(Instant.now(), status, error, message, path);
    }
}
