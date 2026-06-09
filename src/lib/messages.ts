export interface Message {
  id: number;
  title: string;
  content: string;
  emoji: string;
}

export interface ProposalConfig {
  line1: string;
  line2: string;
  yesLabel: string;
  acceptedTitle: string;
  acceptedSub: string;
}

export const DEFAULT_MESSAGES: Message[] = [
  {
    id: 1,
    title: "Lần đầu gặp nhau...",
    emoji: "🌸",
    content: "Lần đầu tiên nhìn thấy em, trái tim mình đã đập loạn nhịp. Có một điều gì đó rất đặc biệt ở em mà mình không thể giải thích được.",
  },
  {
    id: 2,
    title: "Điều mình thích ở em...",
    emoji: "✨",
    content: "Mình thích cái cách em cười, cái cách em nói chuyện, và cả những lúc em vô tình chạm vào trái tim mình mà không biết.",
  },
  {
    id: 3,
    title: "Những lúc nhớ em...",
    emoji: "🌙",
    content: "Có những đêm khuya, mình cứ nghĩ mãi về em. Tự hỏi lúc này em đang làm gì, có đang nghĩ đến mình không...",
  },
  {
    id: 4,
    title: "Mình muốn nói với em...",
    emoji: "💌",
    content: "Mình muốn được ở cạnh em, lắng nghe em kể chuyện, cùng em đi qua những ngày nắng và cả những ngày mưa.",
  },
  {
    id: 5,
    title: "Và điều quan trọng nhất...",
    emoji: "💕",
    content: "Em có thể chưa biết, nhưng em đã trở thành một phần rất quan trọng trong cuộc sống của mình rồi. Mình thích em thật sự.",
  },
];

export const DEFAULT_PROPOSAL: ProposalConfig = {
  line1: "Em có chịu làm",
  line2: "người yêu của mình không? 🥺",
  yesLabel: "Có chứ! 💗",
  acceptedTitle: "Yêu nhau nha! 💕",
  acceptedSub: "Mình hứa sẽ luôn ở bên em 🌸",
};

export function getStoredMessages(): Message[] {
  if (typeof window === "undefined") return DEFAULT_MESSAGES;
  try {
    const stored = localStorage.getItem("love_messages");
    if (!stored) return DEFAULT_MESSAGES;
    return JSON.parse(stored);
  } catch {
    return DEFAULT_MESSAGES;
  }
}

export function saveMessages(messages: Message[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("love_messages", JSON.stringify(messages));
}

export function getStoredProposal(): ProposalConfig {
  if (typeof window === "undefined") return DEFAULT_PROPOSAL;
  try {
    const stored = localStorage.getItem("love_proposal");
    if (!stored) return DEFAULT_PROPOSAL;
    return { ...DEFAULT_PROPOSAL, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_PROPOSAL;
  }
}

export function saveProposal(config: ProposalConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("love_proposal", JSON.stringify(config));
}
