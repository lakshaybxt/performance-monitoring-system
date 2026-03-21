package com.monitoring.auth.domain.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterUserDto {

  @NotBlank(message = "Username is required")
  private String username;

  @Email(message = "Email format is not valid")
  @NotBlank(message = "Email is required")
  private String email;

  @NotBlank(message = "Password is required")
  @Size(min = 7, max = 20, message = "Password must be between {max} and {min} characters")
  private String password;
}
