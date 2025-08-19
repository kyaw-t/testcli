import { Box, Text } from 'ink';

interface RubyBannerProps {
  demoMode?: boolean;
}

export function RubyBanner({ demoMode = false }: RubyBannerProps) {
  const rubyBanner = `
██████╗ ██╗   ██╗██████╗ ██╗   ██╗
██╔══██╗██║   ██║██╔══██╗╚██╗ ██╔╝
██████╔╝██║   ██║██████╔╝ ╚████╔╝ 
██╔══██╗██║   ██║██╔══██╗  ╚██╔╝  
██║  ██║╚██████╔╝██████╔╝   ██║   
╚═╝  ╚═╝ ╚═════╝ ╚═════╝    ╚═╝   
  `;

  if (demoMode) {
    return (
      <Box marginBottom={2} justifyContent="center">
        <Text color="gray">
          demo mode: showing automatic command execution...
        </Text>
      </Box>
    );
  }

  const terminalWidth = process.stdout.columns || 80;
  const bannerLines = rubyBanner.split('\n');
  const rubyAsciiLines = bannerLines.slice(1, 7); // get just the ASCII art lines

  // calculate padding for the lines
  const maxLineLength = Math.max(...rubyAsciiLines.map((line) => line.length));
  const availableWidth = terminalWidth - 10; // account for margins
  const totalPadding = Math.max(0, availableWidth - maxLineLength);
  const sidePadding = Math.floor(totalPadding / 2);
  const lineChar = '═';
  const sideLines = lineChar.repeat(Math.max(3, sidePadding));

  return (
    <Box marginBottom={2} flexDirection="column" alignItems="center">
      {/* ASCII art with side lines and gradient effect */}
      <Box flexDirection="column" alignItems="center">
        {rubyAsciiLines.map((line, index) => {
          // create gradient from dark red to bright red
          const colors = [
            '#8b0000',
            '#a50000',
            '#ba0703',
            '#d32f2f',
            '#ff5722',
          ];
          const colorIndex = Math.floor(
            (index / rubyAsciiLines.length) * (colors.length - 1)
          );

          // only show lines on the middle two rows (index 2 and 3 out of 6 total)
          const showLines = index === 2 || index === 3;

          if (showLines) {
            return (
              <Box key={index} justifyContent="center" alignItems="center">
                <Text color="#ba0703">{sideLines}</Text>
                <Text color={colors[colorIndex]}> {line} </Text>
                <Text color="#ba0703">{sideLines}</Text>
              </Box>
            );
          } else {
            return (
              <Box key={index} justifyContent="center">
                <Text color={colors[colorIndex]}>{line}</Text>
              </Box>
            );
          }
        })}
      </Box>
    </Box>
  );
}
