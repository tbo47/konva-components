import tseslint from 'typescript-eslint'
import unusedImports from 'eslint-plugin-unused-imports'

export default tseslint.config(...tseslint.configs.recommended, {
    ignores: ['**/*.spec.ts'],
    plugins: {
        'unused-imports': unusedImports,
    },
    rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
            'warn',
            {
                vars: 'all',
                varsIgnorePattern: '^_',
                args: 'after-used',
                argsIgnorePattern: '^_',
            },
        ],
    },
})
