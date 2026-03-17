package com.monitoring.service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationRegistrationRequest {

  @NotBlank
  private String name;

  @Pattern(
      regexp = "^(http|https)://.*$",
      message = "Base URL must start with http:// or https://"
  )
  @NotBlank
  private String baseUrl;

  @NotNull
  private UUID userId;

  @NotBlank
  private String email;
}
