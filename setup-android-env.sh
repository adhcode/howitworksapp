#!/bin/bash

# Android Build Environment Setup Script

echo "Setting up Android build environment..."

# Add to ~/.zshrc if not already present
ZSHRC="$HOME/.zshrc"

# Check if ANDROID_HOME is already set
if grep -q "ANDROID_HOME" "$ZSHRC"; then
    echo "✓ ANDROID_HOME already configured in ~/.zshrc"
else
    echo "" >> "$ZSHRC"
    echo "# Android SDK" >> "$ZSHRC"
    echo "export ANDROID_HOME=\$HOME/Library/Android/sdk" >> "$ZSHRC"
    echo "export PATH=\$PATH:\$ANDROID_HOME/emulator" >> "$ZSHRC"
    echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> "$ZSHRC"
    echo "export PATH=\$PATH:\$ANDROID_HOME/cmdline-tools/latest/bin" >> "$ZSHRC"
    echo "✓ Added ANDROID_HOME to ~/.zshrc"
fi

# Check if JAVA_HOME is already set
if grep -q "JAVA_HOME" "$ZSHRC"; then
    echo "✓ JAVA_HOME already configured in ~/.zshrc"
else
    echo "" >> "$ZSHRC"
    echo "# Java 17" >> "$ZSHRC"
    echo "export JAVA_HOME=\$(/usr/libexec/java_home -v 17)" >> "$ZSHRC"
    echo "✓ Added JAVA_HOME to ~/.zshrc"
fi

echo ""
echo "Environment variables configured!"
echo ""
echo "Next steps:"
echo "1. Run: source ~/.zshrc"
echo "2. Verify: echo \$ANDROID_HOME"
echo "3. Build: cd mobile/android && ./gradlew assembleDebug"
