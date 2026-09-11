declare module 'nativewind/preset' {
  import type { Config } from 'tailwindcss';

  const preset: Pick<Config, 'darkMode' | 'theme' | 'plugins'>;
  export default preset;
}
