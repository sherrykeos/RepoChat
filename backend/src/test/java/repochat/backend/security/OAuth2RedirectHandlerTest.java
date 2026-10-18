package repochat.backend.security;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import repochat.backend.config.SecurityConfig;

public class OAuth2RedirectHandlerTest {

    private final SecurityConfig securityConfig = new SecurityConfig();

    @Test
    void testSuccessHandlerUsesConfiguredFrontendUrlDirectly() throws Exception {
        AuthenticationSuccessHandler handler = securityConfig.oauth2SuccessHandler("https://repochat.vercel.app");

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServerName("repochat-backend.onrender.com");
        request.setScheme("https");
        MockHttpServletResponse response = new MockHttpServletResponse();
        Authentication auth = Mockito.mock(Authentication.class);

        handler.onAuthenticationSuccess(request, response, auth);

        assertEquals("https://repochat.vercel.app/auth/callback", response.getRedirectedUrl());
    }

    @Test
    void testSuccessHandlerStripsTrailingSlash() throws Exception {
        AuthenticationSuccessHandler handler = securityConfig.oauth2SuccessHandler("https://repochat.vercel.app/");

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServerName("repochat-backend.onrender.com");
        MockHttpServletResponse response = new MockHttpServletResponse();
        Authentication auth = Mockito.mock(Authentication.class);

        handler.onAuthenticationSuccess(request, response, auth);

        assertEquals("https://repochat.vercel.app/auth/callback", response.getRedirectedUrl());
    }

    @Test
    void testFailureHandlerUsesConfiguredFrontendUrl() throws Exception {
        AuthenticationFailureHandler handler = securityConfig.oauth2FailureHandler("https://repochat.vercel.app");

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServerName("repochat-backend.onrender.com");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AuthenticationException ex = Mockito.mock(AuthenticationException.class);

        handler.onAuthenticationFailure(request, response, ex);

        assertEquals("https://repochat.vercel.app/auth/callback?error=auth_failed", response.getRedirectedUrl());
    }
}
