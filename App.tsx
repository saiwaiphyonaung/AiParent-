import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { AgeSelector } from './components/AgeSelector';
import { FeedbackModal } from './components/FeedbackModal';
import { AIQuickTips } from './components/AIQuickTips';
import { Assistant } from './components/Assistant';
import { TopicSelector } from './components/TopicSelector';
import { AdvicePanel } from './components/AdvicePanel';
import { getAdvice, getBmiAdvice, getQuickTip } from './services/geminiService';
import { AGE_GROUPS, TOPICS } from './constants';
import type { AgeGroup, Topic, HealthRecord, QuickTip } from './types';
import { Banner } from './components/Banner';

// Translation data (remains the same)
const translations = {
  en: {
    introduction: {
      title: "Your Parenting Co-Pilot",
      text: "Navigating parenthood is an adventure. Get instant, AI-powered guidance on your child's health, learning, and growth, right when you need it."
    },
    selectAge: "Select Your Child's Age",
    selectAgeDesc: "Guidance tailored to your child's developmental stage.",
    selectTopic: "What do you need help with?",
    ageGroups: {
      '0-1': '0-1 Yr', '1-3': '1-3 Yrs', '3-5': '3-5 Yrs', '6-8': '6-8 Yrs', '9-12': '9-12 Yrs', '13-16': '13-16+ Yrs',
    },
    topics: {
      care: { title: 'Health & Daily Care', description: 'Tips for sleep, hygiene & wellness.' },
      food: { title: 'Food & Nutrition', description: 'Meal ideas & healthy eating habits.' },
      teaching: { title: 'Learning & Education', description: 'Learning activities & school readiness.' },
      behavior: { title: 'Behavior & Social Skills', description: 'Managing emotions & social skills.' },
      games: { title: 'Games & Activities', description: 'Fun activities for growth & bonding.' },
      health: { title: 'BMI & Health Tracker', description: 'Track weight, height, and BMI.' },
    },
    buttons: { generate: 'Get AI Advice', regenerate: 'Regenerate', generating: 'Generating...', addRecord: 'Add Record', share: 'Share' },
    healthTracker: {
      weight: 'Weight (kg)',
      height: 'Height (cm)',
      history: 'Growth History',
      noHistory: 'No records yet.',
      date: 'Date',
      bmi: 'BMI',
      aiTipTitle: 'AI Health Tip',
      generatingTip: 'Generating health tip...',
      whatIsBmi: 'What is BMI?',
      bmiExplanation: "Body Mass Index (BMI) is a measure that uses your child's weight and height to estimate body fat. It helps doctors see if your child is growing at a healthy rate. It's not a diagnostic tool, but a helpful guide to track development over time.",
      chartView: 'Chart View',
      listView: 'List View',
      weightLabel: 'Weight',
      heightLabel: 'Height',
    },
    feedback: {
      giveFeedback: 'Give Feedback',
      title: 'Share Your Feedback',
      type: 'Feedback Type',
      suggestion: 'Suggestion',
      bug: 'Report a Bug',
      general: 'General Comment',
      messageLabel: 'Your Message',
      messagePlaceholder: 'Tell us what you think...',
      submit: 'Submit Feedback',
      submitting: 'Submitting...',
      successTitle: 'Thank You!',
      successMessage: 'Your feedback has been received. We appreciate your input!',
      error: 'Something went wrong. Please try again.',
      close: 'Close',
    },
    quickTip: {
      title: 'AI Quick Tip',
      button: 'Get Another Tip',
      loading: 'Getting a tip...',
      error: 'Failed to get a quick tip. Please try again.'
    },
    assistant: {
      title: 'AI Parenting Assistant',
      description: 'Have a specific question? Describe your concern, upload images if helpful, and get personalized guidance from our AI assistant.',
      promptPlaceholder: "e.g., What are some creative ways to get my toddler to eat vegetables?",
      imageUpload: 'Upload up to 3 images (optional)',
      imageUploadHelp: 'Click to select or drag & drop',
      imageLimitError: 'You can upload a maximum of 3 images.',
      getHelp: 'Get AI Help',
      gettingHelp: 'Analyzing...',
      responseTitle: 'AI Assistant Says...',
      disclaimer: 'This is AI-generated guidance and not a substitute for professional medical advice. For any health concerns, please consult a doctor.',
      error: 'Sorry, I couldn\'t generate a response. Please try again.',
    },
    sharing: {
      copied: 'Copied!',
      shareTitle: 'Parenting Tip from AiParent',
    },
    disclaimerAI: 'AI-generated advice is for informational purposes only. Always consult a healthcare professional.',
    error: 'Failed to generate advice for {topic}. Please try again.',
    errorBmi: 'Failed to generate BMI advice. Please try again.',
    footer: `Ai Parent © ${new Date().getFullYear()}. AI-powered guidance to support your journey.`,
  },
  my: { // Burmese
    introduction: {
      title: "သင်၏ မိဘအုပ်ထိန်းမှုဆိုင်ရာ အတိုင်ပင်ခံ",
      text: "မိဘအဖြစ် ဖြတ်သန်းခြင်းသည် စွန့်စားခန်းတစ်ခုနှင့်တူသည်။ သင့်ကလေး၏ ကျန်းမာရေး၊ သင်ယူမှုနှင့် ဖွံ့ဖြိုးမှုဆိုင်ရာ AI စွမ်းအင်သုံး လမ်းညွှန်ချက်များကို သင်လိုအပ်သည့်အချိန်တွင် ချက်ချင်းရယူလိုက်ပါ။"
    },
    selectAge: 'သင့်ကလေး၏ အသက်ကို ရွေးပါ။',
    selectAgeDesc: 'သင့်ကလေး၏အဆင့်အတွက် လမ်းညွှန်ချက်။',
    selectTopic: "ဘယ်အကြောင်းအရာကို အကူအညီလိုပါသလဲ?",
    ageGroups: {
      '0-1': '၀-၁ နှစ်', '1-3': '၁-၃ နှစ်', '3-5': '၃-၅ နှစ်', '6-8': '၆-၈ နှစ်', '9-12': '၉-၁၂ နှစ်', '13-16': '၁၃-၁၆+ နှစ်',
    },
    topics: {
      care: { title: 'ကျန်းမာရေးနှင့်နေ့စဉ်စောင့်ရှောက်မှု', description: 'အိပ်စက်ခြင်း၊ သန့်ရှင်းရေးနှင့် ကျန်းမာရေး အကြံပြုချက်များ။' },
      food: { title: 'အစားအစာနှင့်အာဟာရ', description: 'အစားအစာ အကြံဉာဏ်များနှင့် ကျန်းမာသော အလေ့အထများ။' },
      teaching: { title: 'သင်ယူခြင်းနှင့်ပညာရေး', description: 'သင်ယူမှု လှုပ်ရှားမှုများနှင့် ကျောင်းအတွက် အသင့်ဖြစ်မှု။' },
      behavior: { title: 'အမူအကျင့်နှင့်လူမှုရေးကျွမ်းကျင်မှု', description: 'စိတ်ခံစားမှု စီမံခန့်ခွဲခြင်းနှင့် လူမှုရေးကျွမ်းကျင်မှု။' },
      games: { title: 'ဂိမ်းများနှင့် လှုပ်ရှားမှုများ', description: 'ဖွံ့ဖြိုးမှုနှင့် ခင်မင်မှုအတွက် ပျော်စရာ လှုပ်ရှားမှုများ။' },
      health: { title: 'BMI နှင့် ကျန်းမာရေးမှတ်တမ်း', description: 'ကိုယ်အလေးချိန်၊ အရပ်နှင့် BMI ကို ခြေရာခံပါ။' },
    },
    buttons: { generate: 'AI အကြံဉာဏ်ရယူပါ', regenerate: 'ပြန်ထုတ်ပါ', generating: 'ထုတ်လုပ်နေသည်...', addRecord: 'မှတ်တမ်းထည့်ပါ', share: 'မျှဝေပါ' },
    healthTracker: {
      weight: 'ကိုယ်အလေးချိန် (kg)',
      height: 'အရပ် (cm)',
      history: 'ကြီးထွားမှု မှတ်တမ်း',
      noHistory: 'မှတ်တမ်းမရှိသေးပါ။',
      date: 'ရက်စွဲ',
      bmi: 'BMI',
      aiTipTitle: 'AI ကျန်းမာရေး အကြံပြုချက်',
      generatingTip: 'ကျန်းမာရေး အကြံပြုချက် ထုတ်လုပ်နေသည်...',
      whatIsBmi: 'BMI ဆိုတာဘာလဲ?',
      bmiExplanation: 'ကိုယ်အလေးချိန်အညွှန်းကိန်း (BMI) သည် သင့်ကလေး၏ ကိုယ်အလေးချိန်နှင့် အရပ်ကို အသုံးပြု၍ ခန္ဓာကိုယ်အဆီကို ခန့်မှန်းသည့် အတိုင်းအတာတစ်ခုဖြစ်သည်။ ၎င်းသည် သင့်ကလေး ကျန်းမာသောနှုန်းဖြင့် ကြီးထွားနေခြင်း ရှိ၊ မရှိကို ဆရာဝန်များအား ကြည့်ရှုရန် ကူညီပေးသည်။ ၎င်းသည် ရောဂါရှာဖွေရေးကိရိယာမဟုတ်သော်လည်း အချိန်နှင့်အမျှ ဖွံ့ဖြိုးတိုးတက်မှုကို ခြေရာခံရန် အထောက်အကူဖြစ်စေသော လမ်းညွှန်တစ်ခုဖြစ်သည်။',
      chartView: 'ဇယားကွက်',
      listView: 'စာရင်း',
      weightLabel: 'ကိုယ်အလေးချိန်',
      heightLabel: 'အရပ်',
    },
    feedback: {
      giveFeedback: 'အကြံပြုချက်ပေးပါ။',
      title: 'သင်၏အကြံပြုချက်ကို မျှဝေပါ။',
      type: 'အကြံပြုချက်အမျိုးအစား',
      suggestion: 'အကြံပြုချက်',
      bug: 'ချို့ယွင်းချက်ကို သတင်းပို့ပါ',
      general: 'အထွေထွေမှတ်ချက်',
      messageLabel: 'သင်၏စာ',
      messagePlaceholder: 'သင်ထင်မြင်ချက်ကို ပြောပြပါ...',
      submit: 'အကြံပြုချက်တင်သွင်းပါ',
      submitting: 'တင်သွင်းနေသည်...',
      successTitle: 'ကျေးဇူးတင်ပါတယ်!',
      successMessage: 'သင်၏အကြံပြုချက်ကို လက်ခံရရှိထားပါသည်။',
      error: 'တစ်ခုခုမှားယွင်းသွားသည်။ ထပ်ကြိုးစားကြည့်ပါ။',
      close: 'ပိတ်ပါ',
    },
    quickTip: {
      title: 'AI အမြန်အကြံပြုချက်',
      button: 'နောက်ထပ် အကြံပြုချက် ရယူပါ',
      loading: 'အကြံပြုချက် ရယူနေသည်...',
      error: 'အကြံပြုချက် ရယူရန် ပျက်ကွက်ပါသည်။ ထပ်ကြိုးစားကြည့်ပါ။'
    },
    assistant: {
      title: 'AI မိဘအုပ်ထိန်းမှု လက်ထောက်',
      description: 'သင့်တွင် တိကျသောမေးခွန်းရှိပါသလား။ သင်၏စိုးရိမ်မှုကို ဖော်ပြပါ၊ အထောက်အကူဖြစ်ပါက ပုံများထည့်သွင်းပြီး ကျွန်ုပ်တို့၏ AI လက်ထอกจาก ပုဂ္ဂိုလ်ရေးလမ်းညွှန်ချက် ရယူပါ။',
      promptPlaceholder: 'ဥပမာ၊ ကျွန်ုပ်၏ ကလေးငယ်ကို ဟင်းသီးဟင်းရွက်စားရန် ဖန်တီးမှုရှိသော နည်းလမ်းအချို့ကား အဘယ်နည်း။',
      imageUpload: 'ပုံ ၃ ပုံအထိ တင်နိုင်သည် (ရွေးချယ်နိုင်သည်)',
      imageUploadHelp: 'ရွေးချယ်ရန် နှိပ်ပါ သို့မဟုတ် ဆွဲထည့်ပါ',
      imageLimitError: 'သင်သည် အများဆုံး ပုံ ၃ ပုံသာ တင်နိုင်ပါသည်။',
      getHelp: 'AI အကူအညီ ရယူပါ',
      gettingHelp: 'သုံးသပ်နေသည်...',
      responseTitle: 'AI လက်ထောက်မှ ပြောကြားသည်မှာ...',
      disclaimer: 'ဤသည် AI မှထုတ်ပေးသော လမ်းညွှန်ချက်ဖြစ်ပြီး ပညာရှင်ဆိုင်ရာ ဆေးဘက်ဆိုင်ရာ အကြံဉာဏ်အတွက် အစားထိုးမဟုတ်ပါ။ ကျန်းမာရေးဆိုင်ရာ စိုးရိမ်မှုများအတွက် ဆရာဝန်နှင့် တိုင်ပင်ပါ။',
      error: 'တောင်းပန်ပါသည်။ တုံ့ပြန်မှုတစ်ခု ထုတ်လုပ်နိုင်ခြင်းမရှိပါ။ ထပ်ကြိုးစားကြည့်ပါ။',
    },
    sharing: {
      copied: 'ကူးယူပြီးပါပြီ!',
      shareTitle: 'AiParent မှ မိဘအုပ်ထိန်းမှုဆိုင်ရာ အကြံပြုချက်',
    },
    disclaimerAI: 'AI မှထုတ်ပေးသောအကြံဉာဏ်သည် သတင်းအချက်အလက်အတွက်သာဖြစ်သည်။ ကျန်းမာရေးစောင့်ရှောက်မှုပညာရှင်နှင့် အမြဲတိုင်ပင်ပါ။',
    error: '{topic} အတွက် အကြံဉာဏ်ထုတ်ရန် ပျက်ကွက်ပါသည်။',
    errorBmi: 'BMI အကြံဉာဏ်ထုတ်ရန် ပျက်ကွက်ပါသည်။',
    footer: `Ai Parent © ${new Date().getFullYear()}. သင့်ခရီးကို ပံ့ပိုးရန် AI စွမ်းအင်သုံး လမ်းညွှန်။`,
  },
  zh: { // Chinese
    introduction: {
      title: "您的育儿伙伴",
      text: "育儿之路是一场冒险。随时随地获取由人工智能提供的即时指导，涵盖您孩子的健康、学习和成长等方面。"
    },
    selectAge: '选择您孩子的年龄',
    selectAgeDesc: '为您孩子的发展阶段提供指导。',
    selectTopic: "您需要哪方面的帮助？",
    ageGroups: {
      '0-1': '0-1 岁', '1-3': '1-3 岁', '3-5': '3-5 岁', '6-8': '6-8 岁', '9-12': '9-12 岁', '13-16': '13-16+ 岁',
    },
    topics: {
      care: { title: '健康与日常护理', description: '睡眠、卫生及健康小贴士。' },
      food: { title: '食品与营养', description: '膳食建议与健康饮食习惯。' },
      teaching: { title: '学习与教育', description: '学习活动与入学准备。' },
      behavior: { title: '行为与社交技能', description: '情绪管理与社交技巧建议。' },
      games: { title: '游戏与活动', description: '促进成长与亲情的趣味活动。' },
      health: { title: 'BMI与健康追踪器', description: '追踪体重、身高和BMI。' },
    },
    buttons: { generate: '获取AI建议', regenerate: '重新生成', generating: '正在生成...', addRecord: '添加记录', share: '分享' },
    healthTracker: {
      weight: '体重 (kg)',
      height: '身高 (cm)',
      history: '成长历史',
      noHistory: '暂无记录。',
      date: '日期',
      bmi: 'BMI',
      aiTipTitle: 'AI健康提示',
      generatingTip: '正在生成健康提示...',
      whatIsBmi: '什么是BMI？',
      bmiExplanation: '身体质量指数（BMI）是使用您孩子的体重和身高来估算体脂的一种方法。它能帮助医生了解您的孩子是否在以健康的速度成长。它不是一种诊断工具，而是一个有用的指南，用以追踪孩子的长期发育情况。',
      chartView: '图表视图',
      listView: '列表视图',
      weightLabel: '体重',
      heightLabel: '身高',
    },
    feedback: {
      giveFeedback: '提供反馈',
      title: '分享您的反馈',
      type: '反馈类型',
      suggestion: '建议',
      bug: '报告错误',
      general: '一般评论',
      messageLabel: '您的信息',
      messagePlaceholder: '告诉我们您的想法...',
      submit: '提交反馈',
      submitting: '提交中...',
      successTitle: '谢谢！',
      successMessage: '我们已收到您的反馈。感谢您的意见！',
      error: '出了点问题。请再试一次。',
      close: '关闭',
    },
    quickTip: {
      title: 'AI 快速问答',
      button: '换一个问题',
      loading: '正在获取问答...',
      error: '获取快速问答失败，请重试。'
    },
    assistant: {
      title: 'AI 育儿助手',
      description: '有具体问题吗？描述您的问题，如果需要可以上传图片，从我们的 AI 助手中获得个性化指导。',
      promptPlaceholder: '例如，有什么创新的方法能让我的孩子吃蔬菜？',
      imageUpload: '最多上传3张图片（可选）',
      imageUploadHelp: '点击选择或拖放文件',
      imageLimitError: '您最多只能上传3张图片。',
      getHelp: '获取 AI 帮助',
      gettingHelp: '分析中...',
      responseTitle: 'AI 助手说...',
      disclaimer: '这是 AI 生成的指导，不能替代专业的医疗建议。如有任何健康问题，请咨询医生。',
      error: '抱歉，无法生成回应。请再试一次。',
    },
    sharing: {
      copied: '已复制!',
      shareTitle: '来自 AiParent 的育儿技巧',
    },
    disclaimerAI: '人工智能生成的建议仅供参考。请务必咨询医疗保健专业人士。',
    error: '未能为 {topic} 生成建议，请重试。',
    errorBmi: '未能生成BMI建议，请重试。',
    footer: `Ai Parent © ${new Date().getFullYear()}. 人工智能驱动的指南，为您的旅程提供支持。`,
  }
};


const App: React.FC = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const t = useMemo(() => translations[currentLang] || translations.en, [currentLang]);
  
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup>(AGE_GROUPS[0]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const [advice, setAdvice] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(() => {
    try {
      const savedRecords = localStorage.getItem('healthRecords');
      return savedRecords ? JSON.parse(savedRecords) : [];
    } catch (error) {
      console.error("Failed to parse health records from localStorage", error);
      return [];
    }
  });

  const [bmiAdvice, setBmiAdvice] = useState<string | undefined>(undefined);
  const [isBmiLoading, setIsBmiLoading] = useState(false);

  const [quickTip, setQuickTip] = useState<QuickTip | null>(null);
  const [isQuickTipLoading, setIsQuickTipLoading] = useState(true);

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('healthRecords', JSON.stringify(healthRecords));
  }, [healthRecords]);

  const handleGenerateAdvice = useCallback(async (topic: Topic) => {
    if (!topic || topic.id === 'health') return;
  
    setIsLoading(prev => ({ ...prev, [topic.id]: true }));
    setAdvice(prev => ({ ...prev, [topic.id]: '' }));
    
    try {
      const result = await getAdvice(selectedAgeGroup.label, t.topics[topic.id]?.title || topic.title, currentLang);
      setAdvice(prev => ({ ...prev, [topic.id]: result }));
    } catch (error) {
      console.error(error);
      setAdvice(prev => ({ ...prev, [topic.id]: t.error.replace('{topic}', t.topics[topic.id]?.title || topic.title) }));
    } finally {
      setIsLoading(prev => ({ ...prev, [topic.id]: false }));
    }
  }, [selectedAgeGroup, currentLang, t]);

  useEffect(() => {
    if (selectedTopic && !advice[selectedTopic.id] && selectedTopic.id !== 'health' && !isLoading[selectedTopic.id]) {
      handleGenerateAdvice(selectedTopic);
    }
  }, [selectedTopic, advice, isLoading, handleGenerateAdvice]);

  const handleAddHealthRecord = useCallback(async ({ weight, height }: { weight: string, height: string }) => {
    setIsBmiLoading(true);
    setBmiAdvice(undefined);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const heightInMeters = heightNum / 100;
    const bmi = parseFloat((weightNum / (heightInMeters * heightInMeters)).toFixed(1));

    const newRecord: HealthRecord = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      ageGroup: selectedAgeGroup.id,
      weight: weightNum,
      height: heightNum,
      bmi: bmi,
    };

    setHealthRecords(prevRecords => [newRecord, ...prevRecords]);

    try {
      const result = await getBmiAdvice(selectedAgeGroup.label, weightNum, heightNum, bmi, currentLang);
      setBmiAdvice(result);
    } catch (error) {
      console.error(error);
      setBmiAdvice(t.errorBmi);
    } finally {
      setIsBmiLoading(false);
    }
  }, [selectedAgeGroup, currentLang, t.errorBmi]);

  const handleFetchQuickTip = useCallback(async (ageGroup: AgeGroup = selectedAgeGroup) => {
    setIsQuickTipLoading(true);
    try {
      const tip = await getQuickTip(ageGroup.label, currentLang);
      setQuickTip(tip);
    } catch (error) {
      console.error("Failed to get quick tip:", error);
      setQuickTip({ question: 'Error', answer: t.quickTip.error });
    } finally {
      setIsQuickTipLoading(false);
    }
  }, [currentLang, selectedAgeGroup, t.quickTip.error]);
  
  useEffect(() => {
    handleFetchQuickTip();
  }, [handleFetchQuickTip]);

  const handleSelectAgeGroup = (ageGroup: AgeGroup) => {
    setSelectedAgeGroup(ageGroup);
    setAdvice({});
    setBmiAdvice(undefined);
    if (selectedTopic && selectedTopic.id !== 'health') {
      // Re-fetch for the new age group
      const topicToRefetch = TOPICS.find(t => t.id === selectedTopic.id);
      if(topicToRefetch) handleGenerateAdvice(topicToRefetch);
    }
    handleFetchQuickTip(ageGroup);
  };
  
  const handleLangChange = (langId: string) => {
    setCurrentLang(langId);
    setAdvice({}); // Clear advice cache on language change
    setBmiAdvice(undefined);
    setQuickTip(null); // Clear quick tip
  };

  return (
    <>
      <Header 
        currentLang={currentLang}
        languages={[{id: 'en', label: 'EN'}, {id: 'my', label: 'MY'}, {id: 'zh', label: 'ZH'}]}
        onLangChange={handleLangChange}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">

        <Banner title={t.introduction.title} text={t.introduction.text} />

        <section className="text-center my-8 md:my-12 animate-fadeInUp">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{t.selectAge}</h2>
          <p className="mt-2 text-base md:text-lg text-slate-600">{t.selectAgeDesc}</p>
          <div className="mt-6">
            <AgeSelector
              ageGroups={AGE_GROUPS.map(ag => ({ ...ag, label: t.ageGroups[ag.id] || ag.label }))}
              selectedAgeGroup={{ ...selectedAgeGroup, label: t.ageGroups[selectedAgeGroup.id] || selectedAgeGroup.label}}
              onSelectAgeGroup={(ag) => {
                const originalAg = AGE_GROUPS.find(orig => orig.id === ag.id);
                if (originalAg) handleSelectAgeGroup(originalAg);
              }}
            />
          </div>
        </section>

        <section className="my-8 md:my-12">
          <div className="text-center mb-6 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{t.selectTopic}</h2>
          </div>
          <TopicSelector
            topics={TOPICS}
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
            translations={t.topics}
          />
        </section>

        <AdvicePanel
          topic={selectedTopic}
          advice={selectedTopic ? advice[selectedTopic.id] : undefined}
          isLoading={selectedTopic ? !!isLoading[selectedTopic.id] : false}
          onGenerate={() => selectedTopic && handleGenerateAdvice(selectedTopic)}
          healthRecords={healthRecords.filter(r => r.ageGroup === selectedAgeGroup.id)}
          onAddHealthRecord={handleAddHealthRecord}
          bmiAdvice={bmiAdvice}
          isBmiLoading={isBmiLoading}
          buttonText={t.buttons}
          translations={t.healthTracker}
          sharingTranslations={t.sharing}
          disclaimerText={t.disclaimerAI}
        />

        <div className="my-8 md:my-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
           <AIQuickTips
              tip={quickTip}
              isLoading={isQuickTipLoading}
              onGetNewTip={() => handleFetchQuickTip()}
              translations={t.quickTip}
           />
           <Assistant translations={t.assistant} language={currentLang} />
        </div>

      </main>
      <footer className="text-center py-6 border-t border-slate-200">
        <p className="text-sm text-slate-500">
          {t.footer}
        </p>
        <button onClick={() => setIsFeedbackModalOpen(true)} className="mt-2 text-sm text-rose-600 hover:underline font-semibold">
          {t.feedback.giveFeedback}
        </button>
      </footer>
      <FeedbackModal 
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        translations={t.feedback}
      />
    </>
  );
};

export default App;