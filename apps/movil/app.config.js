/**
 * el equipo de firma de Apple no se guarda en el repositorio: se lee de APPLE_TEAM_ID al compilar.
 * Uso: APPLE_TEAM_ID=XXXXXXXXXX npx expo prebuild  (o exportarla en el shell)
 */
module.exports = ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    ...(process.env.APPLE_TEAM_ID
      ? { appleTeamId: process.env.APPLE_TEAM_ID }
      : {}),
  },
});
