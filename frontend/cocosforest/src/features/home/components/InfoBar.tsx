
import { View, Text } from "react-native";
import { homeStyles as s } from "../styles/homeStyles";

type Props = { points: string; growth: string | number };



export default function InfoBar({ points, growth }: Props) {
  return (
    <View style={s.infoBar}>
      <View style={s.infoBlock}>
        <Text style={s.infoLabel}>💰 보유 포인트</Text>
        <Text style={s.infoValue}>{points}</Text>
      </View>
      <View style={s.infoDivider} />
      <View style={s.infoBlock}>
        <Text style={s.infoLabel}>🌳 나무 개수</Text>
        <Text style={[s.infoValue, s.growthValue]}>{growth}그루</Text>
      </View>
    </View>
  );
}

