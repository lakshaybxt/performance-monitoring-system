package com.monitoring.service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class GatewayHeaderFilter extends OncePerRequestFilter {

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
    String userId = request.getHeader("X-User-Id");
    String username = request.getHeader("X-Username");
    String userRoles = request.getHeader("X-User-Roles");

    if(userId != null && username != null) {
      List<SimpleGrantedAuthority> authorities = parseRoles(userRoles);

      UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
          userId, null, authorities
      );

      authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
      SecurityContextHolder.getContext().setAuthentication(authToken);
    }

    filterChain.doFilter(request, response);
  }

  private List<SimpleGrantedAuthority> parseRoles(String userRoles) {
    if(userRoles == null || userRoles.isEmpty()) {
      return List.of();
    }

    return Arrays.stream(userRoles.split(","))
        .map(role -> new SimpleGrantedAuthority("ROLE_" + role.trim()))
        .toList();
  }
}
