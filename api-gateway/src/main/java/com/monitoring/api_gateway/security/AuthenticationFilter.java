package com.monitoring.api_gateway.security;

import com.monitoring.api_gateway.service.JwtService;
import io.jsonwebtoken.Claims;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class AuthenticationFilter implements GlobalFilter, Ordered {

  private final JwtService jwtService;

  public AuthenticationFilter(JwtService jwtService) {
    this.jwtService = jwtService;
  }

  private static final List<String> PUBLIC_PATHS = List.of(
      "/auth/login",
      "/auth/register",
      "/auth/verify",
      "/graphiql",
      "/graphiql?path=/graphql"
  );

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    String path = exchange.getRequest().getURI().getPath();

    // Skip filter for public endpoints
    if (isPublicPath(path)) {
      return chain.filter(exchange);
    }

    try {
      String token = extractToken(exchange);

      if(token == null) {
        return unauthorized(exchange);
      }

      Claims claims = jwtService.extractAllClaims(token);

      String userId = claims.get("userId", String.class);
      String username = claims.get("username", String.class);
      String roles = claims.get("roles", String.class);

      if  (userId == null || !jwtService.validateToken(token)) {
        return unauthorized(exchange);
      }

      // Add headers for downstream services
      ServerWebExchange mutatedExchange = exchange.mutate()
          .request(r -> r
              .header("X-User-Id", userId)
              .header("X-Username", username)
              .header("X-User-Roles", roles != null ? roles : "")
          )
          .build();

      return chain.filter(mutatedExchange);

    } catch (Exception e) {
      return unauthorized(exchange);
    }
  }

  private String extractToken(ServerWebExchange exchange) {
    String authHeader = exchange.getRequest()
        .getHeaders()
        .getFirst(HttpHeaders.AUTHORIZATION);

    return (authHeader != null && authHeader.startsWith("Bearer "))
        ? authHeader.substring(7)
        : null;
  }

  private boolean isPublicPath(String path) {
    return PUBLIC_PATHS.stream().anyMatch(path::startsWith);
  }

  private Mono<Void> unauthorized(ServerWebExchange exchange) {
    exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
    return exchange.getResponse().setComplete();
  }

  @Override
  public int getOrder() {
    return -1;
  }
}