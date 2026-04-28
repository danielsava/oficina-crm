package modules.iam.auth.util;

import java.util.regex.Pattern;

public class PasswordValidatorUtil {

    private static final int MIN_LENGTH = 8;

    private static final int MIN_ENTROPY_BITS = 50;

    // Regex básica: não substitui análise de entropia, mas filtra casos grotescos
    private static final Pattern HAS_UPPER = Pattern.compile("[A-Z]");

    private static final Pattern HAS_LOWER = Pattern.compile("[a-z]");

    private static final Pattern HAS_DIGIT = Pattern.compile("[0-9]");

    private static final Pattern HAS_SPECIAL = Pattern.compile("[^A-Za-z0-9]");


    public static ValidationResult validate(String password) {

        if (password == null || password.length() < MIN_LENGTH)
            return ValidationResult.rejected("Senha deve ter no mínimo " + MIN_LENGTH + " caracteres");

        int charSpace = 0;

        if (HAS_UPPER.matcher(password).find()) charSpace += 26;

        if (HAS_LOWER.matcher(password).find()) charSpace += 26;

        if (HAS_DIGIT.matcher(password).find()) charSpace += 10;

        if (HAS_SPECIAL.matcher(password).find()) charSpace += 32;

        if (charSpace < 64) // exige pelo menos 3 categorias de caracteres
            return ValidationResult.rejected("Senha deve conter maiúsculas, minúsculas, números e caracteres especiais");

        double entropy = password.length() * (Math.log(charSpace) / Math.log(2));

        if (entropy < MIN_ENTROPY_BITS)
            return ValidationResult.rejected("Senha muito previsível. Aumente complexidade ou tamanho");

        // Rejeita padrões comuns (simplificado — em produção use uma lista como rockyou.txt)
        String lower = password.toLowerCase();

        if (lower.contains("password") || lower.contains("123456") || lower.contains("qwerty") || lower.contains("abc"))
            return ValidationResult.rejected("Senha contém padrão comum e inseguro");

        return ValidationResult.accepted(entropy);
    }


    public record ValidationResult(boolean accepted, String reason, double entropyBits) {

        static ValidationResult accepted(double entropy) {

            return new ValidationResult(true, null, entropy);
        }

        static ValidationResult rejected(String reason) {

            return new ValidationResult(false, reason, 0.0);
        }
    }

}
