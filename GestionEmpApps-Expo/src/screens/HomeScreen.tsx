import { StyledView } from '../components/StyledView';
import { StyledText } from '../components/StyledText';

export default function HomeScreen() {
  return (
    <StyledView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
      <StyledText style={{ fontSize: 18, fontWeight: 'bold' }}>Pantalla de inicio</StyledText>
    </StyledView>
  );
}
