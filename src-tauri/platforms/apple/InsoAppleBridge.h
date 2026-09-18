#ifndef InsoAppleBridge_h
#define InsoAppleBridge_h

#include <stdint.h>
#include <stdbool.h>

// Keychain
int32_t inso_apple_keychain_set(const char* key, const char* value);
char* inso_apple_keychain_get(const char* key);
int32_t inso_apple_keychain_delete(const char* key);
void inso_apple_free_string(char* ptr);

// Screen Vision
char* inso_apple_capture_display(void);
int32_t inso_apple_get_display_count(void);

// Accessibility & Computer Use
bool inso_apple_check_accessibility_permission(void);
int32_t inso_apple_mouse_move(double x, double y);
int32_t inso_apple_mouse_click(double x, double y, int32_t button);
int32_t inso_apple_type_text(const char* text);
int32_t inso_apple_key_press(uint16_t virtualKey, uint64_t flags);

// Neural Engine & Hardware
char* inso_apple_hardware_telemetry(void);

// Menu Bar
int32_t inso_apple_setup_menu_bar(const char* title);
int32_t inso_apple_update_menu_bar(const char* status);

#endif /* InsoAppleBridge_h */
