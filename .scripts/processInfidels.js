const fs = require('fs');

const INPUT = './infidelsContradictions.json';
const OUTPUT = './infidelsContradictions.json';

const raw = JSON.parse(fs.readFileSync(INPUT, 'utf8'));

// Map of original question text → { question, answers: [{ answer, refs[] }] }
// "refs" are the Bible reference strings to match from the raw data
const transforms = {
  "God good to all, or just a few?": {
    question: "Is God good to all, or just a few?",
    answers: [
      { answer: "God is good to all", refs: ["Psalms 145:9", "Psalms 145:20"] },
      { answer: "God is merciless and destructive", refs: ["Jeremiah 13:14"] }
    ]
  },
  "War or Peace?": {
    question: "Is God a god of war or peace?",
    answers: [
      { answer: "God is a god of war", refs: ["Exodus 15:3"] },
      { answer: "God is a god of peace", refs: ["Romans 15:33"] }
    ]
  },
  "Who is the father of Joseph?": {
    question: "Who is the father of Joseph (husband of Mary)?",
    answers: [
      { answer: "Jacob", refs: ["Matthew 1:16"] },
      { answer: "Heli", refs: ["Luke 3:23"] }
    ]
  },
  "Who was at the Empty Tomb? Is it:": {
    question: "Who visited Jesus' empty tomb?",
    answers: [
      { answer: "Mary Magdalene and the other Mary", refs: ["Matthew 28:1"] },
      { answer: "Mary Magdalene, Mary mother of James, and Salome", refs: ["Mark 16:1"] },
      { answer: "Mary Magdalene alone", refs: ["John 20:1"] }
    ]
  },
  "Is Jesus equal to or lesser than?": {
    question: "Is Jesus equal to or lesser than God the Father?",
    answers: [
      { answer: "Jesus and the Father are equal", refs: ["John 10:30"] },
      { answer: "The Father is greater than Jesus", refs: ["John 14:28"] }
    ]
  },
  "Which first--beasts or man?": {
    question: "Which were created first, beasts or man?",
    answers: [
      { answer: "Beasts were created before man", refs: ["Genesis 1:25", "Genesis 1:26"] },
      { answer: "Man was created before beasts", refs: ["Genesis 2:18", "Genesis 2:19"] }
    ]
  },
  "How many stalls and horsemen?": {
    question: "How many stalls and horsemen did Solomon have?",
    answers: [
      { answer: "Forty thousand stalls and twelve thousand horsemen", refs: ["1 Kings 4:26"] },
      { answer: "Four thousand stalls and twelve thousand horsemen", refs: ["2 Chronicles 9:25"] }
    ]
  },
  "Is it folly to be wise or not?": {
    question: "Is it folly to be wise or not?",
    answers: [
      { answer: "Wisdom is the most important thing", refs: ["Proverbs 4:7"] },
      { answer: "Wisdom brings grief and sorrow", refs: ["Ecclesiastes 1:18"] },
      { answer: "God will destroy the wisdom of the wise", refs: ["1 Corinthians 1:19"] }
    ]
  },
  "Human vs. ghostly impregnation": {
    question: "Was Jesus conceived by human or divine means?",
    answers: [
      { answer: "Jesus was a physical descendant of David", refs: ["Acts 2:30"] },
      { answer: "Jesus was conceived by the Holy Ghost", refs: ["Matthew 1:18"] }
    ]
  },
  "The sins of the father": {
    question: "Are children punished for the sins of their parents?",
    answers: [
      { answer: "Yes, children are punished for their parents' sins", refs: ["Isaiah 14:21"] },
      { answer: "No, each person dies for their own sin", refs: ["Deuteronomy 24:16"] }
    ]
  },
  "Rabbits do not chew their cud": {
    question: "Do rabbits chew their cud?",
    answers: [
      { answer: "The Bible claims rabbits chew their cud, but they do not", refs: ["Leviticus 11:6"] }
    ]
  },
  "Fowl from waters or ground?": {
    question: "Were fowl created from water or from the ground?",
    answers: [
      { answer: "Fowl came from the waters", refs: ["Genesis 1:20", "Genesis 1:21"] },
      { answer: "Fowl were formed from the ground", refs: ["Genesis 2:19"] }
    ]
  },
  "Odd genetics": {
    question: "Can visual stimuli during conception affect the appearance of offspring?",
    answers: [
      { answer: "The Bible claims striped rods caused striped offspring", refs: ["Genesis 30:39"] }
    ]
  },
  "The shape of the earth": {
    question: "What is the shape of the earth?",
    answers: [
      { answer: "The earth is a circle (sphere)", refs: ["Isaiah 40:22"] },
      { answer: "All kingdoms can be seen from a high mountain, implying a flat earth", refs: ["Matthew 4:8"] }
    ]
  },
  "Snakes, while built low, do not eat dirt": {
    question: "Do snakes eat dust?",
    answers: [
      { answer: "The Bible claims snakes eat dust, but they do not", refs: ["Genesis 3:14"] }
    ]
  },
  "Earth supported? Heaven supported too": {
    question: "Is the earth supported or unsupported?",
    answers: [
      { answer: "The earth hangs upon nothing", refs: ["Job 26:7"] },
      { answer: "The earth has foundations", refs: ["Job 38:4"] },
      { answer: "Heaven is held up by pillars", refs: ["Job 26:11"] }
    ]
  },
  "The hydrological cycle": {
    question: "How does the water cycle work according to the Bible?",
    answers: [
      { answer: "Rivers flow to the sea and return to their source (accurate cycle)", refs: ["Ecclesiastes 1:7"] },
      { answer: "Snow and hail are stored in treasuries (storehouses)", refs: ["Job 38:22"] }
    ]
  },
  "Order of creation": {
    question: "What was the order of creation?",
    answers: [
      { answer: "Genesis 1 order: light, sky, land/plants, sun/moon, sea creatures/birds, land animals, man and woman together", refs: ["Genesis 1:1-31"] },
      { answer: "Genesis 2 order: man, garden/trees, animals, woman from man's rib", refs: ["Genesis 2:1-25"] }
    ]
  },
  "Moses' personality": {
    question: "Was Moses meek or aggressive?",
    answers: [
      { answer: "Moses was the meekest man on earth", refs: ["Numbers 12:3"] },
      { answer: "Moses was wrathful and commanded killing", refs: ["Numbers 31:14"] }
    ]
  },
  "Righteous live?": {
    question: "Do the righteous flourish or perish?",
    answers: [
      { answer: "The righteous flourish", refs: ["Psalms 92:12"] },
      { answer: "The righteous perish and no one cares", refs: ["Isaiah 57:1"] }
    ]
  },
  "Jesus' first sermon plain or mount?": {
    question: "Did Jesus preach his first sermon on a plain or a mountain?",
    answers: [
      { answer: "On a mountain", refs: ["Matthew 5:1"] },
      { answer: "On a plain", refs: ["Luke 6:17"] }
    ]
  },
  "Jesus' last words": {
    question: "What were Jesus' last words on the cross?",
    answers: [
      { answer: "\"My God, my God, why hast thou forsaken me?\"", refs: ["Matthew 27:46"] },
      { answer: "\"Father, into thy hands I commend my spirit\"", refs: ["Luke 23:46"] },
      { answer: "\"It is finished\"", refs: ["John 19:30"] }
    ]
  },
  "Years of famine": {
    question: "How many years of famine were offered as punishment for David's sin?",
    answers: [
      { answer: "Seven years of famine", refs: ["1 Samuel 24:13"] },
      { answer: "Three years of famine", refs: ["1 Chronicles 21:11"] }
    ]
  },
  "The GENEALOGY OF JESUS?": {
    question: "What is the genealogy of Jesus through David?",
    answers: [
      { answer: "Through Solomon (David's son by Bathsheba)", refs: ["Matthew 1:6"] },
      { answer: "Through Nathan (a different son of David)", refs: ["Luke 3:23"] }
    ]
  },
  "God be seen?": {
    question: "Can God be seen?",
    answers: [
      { answer: "Yes, God has been seen by people", refs: ["Exodus 24:9", "Amos 9:1", "Genesis 26:2", "John 14:9", "Exodus 33:23", "Exodus 33:11", "Genesis 32:30"] },
      { answer: "No, no one can see God and live", refs: ["John 1:18", "Exodus 33:20", "1 Timothy 6:16"] }
    ]
  },
  "CRUEL, UNMERCIFUL, DESTRUCTIVE, and FEROCIOUS or KIND, MERCIFUL, and GOOD:": {
    question: "Is God cruel and destructive, or kind and merciful?",
    answers: [
      { answer: "God is cruel and merciless", refs: ["Jeremiah 13:14"] },
      { answer: "God is kind and merciful", refs: ["James 5:11", "1 Chronicles 16:34", "Psalms 145:9", "1 John 4:16"] }
    ]
  },
  "Tempts?": {
    question: "Does God tempt people?",
    answers: [
      { answer: "Yes, God tempts people", refs: ["Genesis 22:1"] },
      { answer: "No, God tempts no one", refs: ["James 1:13"] }
    ]
  },
  "Judas died how?": {
    question: "How did Judas die?",
    answers: [
      { answer: "He hanged himself", refs: ["Matthew 27:5"] },
      { answer: "He fell headlong and burst open", refs: ["Acts 1:18"] }
    ]
  },
  "Ascend to heaven": {
    question: "Has anyone besides Jesus ascended to heaven?",
    answers: [
      { answer: "Yes, Elijah ascended to heaven in a whirlwind", refs: ["2 Kings 2:11"] },
      { answer: "No, only the Son of Man has ascended to heaven", refs: ["John 3:13"] }
    ]
  },
  "What was Jesus' prediction regarding Peter's denial?": {
    question: "What was Jesus' prediction regarding Peter's denial?",
    answers: [
      { answer: "Before the cock crows once, Peter will deny Jesus three times", refs: ["Matthew 26:34"] },
      { answer: "Before the cock crows twice, Peter will deny Jesus three times", refs: ["Mark 14:30"] }
    ]
  },
  "How many times did the cock crow?": {
    question: "How many times did the cock crow?",
    answers: [
      { answer: "The cock crowed twice", refs: ["Mark 14:72"] },
      { answer: "The cock crowed once", refs: ["Matthew 26:74", "Matthew 26:75", "Luke 22:60", "Luke 22:61", "John 13:38", "John 18:27"] }
    ]
  },
  "How many beatitudes in the Sermon on the Mount": {
    question: "How many beatitudes are in the Sermon on the Mount?",
    answers: [
      { answer: "Nine beatitudes (Matthew's account)", refs: ["Matthew 5:3", "Matthew 5:4", "Matthew 5:5", "Matthew 5:6", "Matthew 5:7", "Matthew 5:8", "Matthew 5:9", "Matthew 5:10", "Matthew 5:11"] },
      { answer: "Four beatitudes (Luke's account)", refs: ["Luke 6:20", "Luke 6:21", "Luke 6:22", "Luke 6:23"] }
    ]
  },
  "Does every man sin?": {
    question: "Does every person sin?",
    answers: [
      { answer: "Yes, there is no one who does not sin", refs: ["1 Kings 8:46", "2 Chronicles 6:36", "Proverbs 20:9", "Ecclesiastes 7:20"] }
    ]
  },
  "Who bought potter's field": {
    question: "Who bought the potter's field?",
    answers: [
      { answer: "Judas bought it himself", refs: ["Acts 1:18", "Acts 1:19"] },
      { answer: "The chief priests bought it", refs: ["Matthew 27:6", "Matthew 27:7", "Matthew 27:8"] }
    ]
  },
  "Who prophesied the potter's field?": {
    question: "Who prophesied about the thirty pieces of silver and the potter's field?",
    answers: [
      { answer: "Matthew attributes it to Jeremiah", refs: ["Matthew 27:9"] },
      { answer: "The prophecy is actually found in Zechariah", refs: ["Zechariah 11:12"] }
    ]
  },
  "Do you answer a fool?": {
    question: "Should you answer a fool according to his folly?",
    answers: [
      { answer: "No, do not answer a fool or you will be like him", refs: ["Proverbs 26:4"] },
      { answer: "Yes, answer a fool or he will think himself wise", refs: ["Proverbs 26:5"] }
    ]
  },
  "How many children did Michal, the daughter of Saul, have?": {
    question: "How many children did Michal, the daughter of Saul, have?",
    answers: [
      { answer: "No children", refs: ["2 Samuel 6:23"] },
      { answer: "Five sons", refs: ["2 Samuel 21:8"] }
    ]
  },
  "How old was Jehoiachin when he began to reign?": {
    question: "How old was Jehoiachin when he began to reign?",
    answers: [
      { answer: "Eighteen years old", refs: ["2 Kings 24:8"] },
      { answer: "Eight years old", refs: ["2 Chronicles 36:9"] }
    ]
  },
  "Marriage?": {
    question: "Is marriage good or should it be avoided?",
    answers: [
      { answer: "Marriage is good and brings God's favor", refs: ["Proverbs 18:22"] },
      { answer: "It is better not to marry", refs: ["1 Corinthians 7:1", "1 Corinthians 7:27"] },
      { answer: "Marriage is permitted but singleness is better", refs: ["1 Corinthians 7:2", "1 Corinthians 7:39", "1 Corinthians 7:40"] }
    ]
  },
  "Did those with Saul/Paul at his conversion hear a voice?": {
    question: "Did those with Saul/Paul at his conversion hear a voice?",
    answers: [
      { answer: "Yes, they heard a voice but saw no one", refs: ["Acts 9:7"] },
      { answer: "No, they saw a light but did not hear the voice", refs: ["Acts 22:9"] }
    ]
  },
  "Where was Jesus three days after his baptism?": {
    question: "Where was Jesus three days after his baptism?",
    answers: [
      { answer: "In the wilderness, driven there by the Spirit", refs: ["Mark 1:12"] },
      { answer: "In Galilee, attending a wedding and calling disciples", refs: ["John 1:35"] }
    ]
  },
  "How many apostles were in office between the resurrection and ascension?": {
    question: "How many apostles were in office between the resurrection and ascension?",
    answers: [
      { answer: "Twelve apostles", refs: ["1 Corinthians 15:5"] },
      { answer: "Eleven apostles (Judas had died)", refs: ["Matthew 27:3", "Matthew 28:16", "Acts 1:9"] }
    ]
  },
  "Judging": {
    question: "Should Christians judge others?",
    answers: [
      { answer: "Yes, the spiritual person judges all things", refs: ["1 Corinthians 2:15"] },
      { answer: "No, judge nothing before the Lord comes", refs: ["1 Corinthians 4:5"] }
    ]
  },
  "Good deeds": {
    question: "Should good deeds be done publicly or in secret?",
    answers: [
      { answer: "Let your good works be seen by others", refs: ["Matthew 5:16"] },
      { answer: "Do your good deeds in secret", refs: ["Matthew 6:3"] }
    ]
  },
  "For or against?": {
    question: "Is whoever is not with Jesus against him, or for him?",
    answers: [
      { answer: "Whoever is not with me is against me", refs: ["Matthew 12:30"] },
      { answer: "Whoever is not against us is for us", refs: ["Mark 9:40", "Luke 9:50"] }
    ]
  },
  "Whom did they see at the tomb?": {
    question: "Who was seen at Jesus' tomb after the resurrection?",
    answers: [
      { answer: "One angel who descended from heaven", refs: ["Matthew 28:2", "Matthew 28:3", "Matthew 28:4", "Matthew 28:5"] },
      { answer: "A young man in a white garment", refs: ["Mark 16:5"] },
      { answer: "Two men in shining garments", refs: ["Luke 24:4"] },
      { answer: "Two angels in white", refs: ["John 20:12"] }
    ]
  },
  "God change?": {
    question: "Does God change his mind?",
    answers: [
      { answer: "No, God does not change", refs: ["Malachi 3:6", "James 1:17", "1 Samuel 15:29"] },
      { answer: "Yes, God repents and changes his mind", refs: ["Jonah 3:10", "Genesis 6:6"] }
    ]
  },
  "Destruction of cities (what said was jeremiah was zechariah)": {
    question: "Who prophesied about the thirty pieces of silver?",
    answers: [
      { answer: "Matthew attributes the prophecy to Jeremiah", refs: ["Matthew 27:9"] },
      { answer: "The prophecy is actually from Zechariah", refs: ["Zechariah 11:11"] }
    ]
  },
  "Whose sepulchers": {
    question: "Who bought the burial sepulcher from the sons of Hamor?",
    answers: [
      { answer: "Abraham bought it", refs: ["Acts 7:16"] },
      { answer: "Abraham bought a different field from Ephron the Hittite; Jacob dealt with Hamor", refs: ["Genesis 23:17"] }
    ]
  },
  "When second coming?": {
    question: "When will Jesus return?",
    answers: [
      { answer: "Within the lifetime of his listeners' generation", refs: ["Matthew 24:34", "Mark 13:30", "Luke 21:32", "1 Thessalonians 4:15"] }
    ]
  },
  "Solomon's overseers": {
    question: "How many chief overseers did Solomon have?",
    answers: [
      { answer: "Five hundred and fifty", refs: ["1 Kings 9:23"] },
      { answer: "Two hundred and fifty", refs: ["2 Chronicles 8:10"] }
    ]
  },
  "The mother of Abijah:": {
    question: "Who was the mother of Abijah?",
    answers: [
      { answer: "Maachah, daughter of Absalom", refs: ["2 Chronicles 11:20"] },
      { answer: "Michaiah, daughter of Uriel of Gibeah", refs: ["2 Chronicles 13:2"] }
    ]
  },
  "When did Baasha die?": {
    question: "When did Baasha die?",
    answers: [
      { answer: "In the 26th year of King Asa's reign", refs: ["1 Kings 16:6"] },
      { answer: "He was still alive in the 36th year of Asa's reign", refs: ["2 Chronicles 16:1"] }
    ]
  },
  "How old was Ahaziah when he began to reign?": {
    question: "How old was Ahaziah when he began to reign?",
    answers: [
      { answer: "Twenty-two years old", refs: ["2 Kings 8:26"] },
      { answer: "Forty-two years old", refs: ["2 Chronicles 22:2"] }
    ]
  },
  "What was the color of the robe placed on Jesus during his trial?": {
    question: "What color was the robe placed on Jesus during his trial?",
    answers: [
      { answer: "Scarlet", refs: ["Matthew 27:28"] },
      { answer: "Purple", refs: ["John 19:2"] }
    ]
  },
  "What did they give him to drink?": {
    question: "What did they give Jesus to drink at the crucifixion?",
    answers: [
      { answer: "Vinegar mixed with gall", refs: ["Matthew 27:34"] },
      { answer: "Wine mixed with myrrh", refs: ["Mark 15:23"] }
    ]
  },
  "How long was Jesus in the tomb?": {
    question: "How long was Jesus in the tomb?",
    answers: [
      { answer: "Three days and three nights", refs: ["Matthew 12:40"] },
      { answer: "He rose on the third day (Friday evening to Sunday morning is less than three nights)", refs: ["Mark 10:34"] }
    ]
  }
};

function buildRefMap(rawAnswers) {
  const map = {};
  for (const a of rawAnswers) {
    for (const ref of a.bibleReferences) {
      map[ref] = a;
    }
  }
  return map;
}

const processed = raw.map(entry => {
  const transform = transforms[entry.question];
  if (!transform) {
    console.warn(`No transform for: "${entry.question}" — passing through`);
    return entry;
  }

  const refMap = buildRefMap(entry.answers);
  const newAnswers = transform.answers.map(ta => {
    const explanations = [];
    const bibleRefs = [];
    for (const ref of ta.refs) {
      const rawAnswer = refMap[ref];
      if (rawAnswer) {
        explanations.push(`${rawAnswer.answerExplanation} (${ref})`);
        bibleRefs.push(ref);
      } else {
        console.warn(`  Missing ref "${ref}" in "${entry.question}"`);
        bibleRefs.push(ref);
      }
    }
    return {
      answer: ta.answer,
      answerExplanation: explanations.join('\n\n'),
      bibleReferences: bibleRefs
    };
  });

  return {
    question: transform.question,
    questionUrl: entry.questionUrl,
    answers: newAnswers
  };
});

fs.writeFileSync(OUTPUT, JSON.stringify(processed, null, 2), 'utf8');
console.log(`Processed ${processed.length} contradictions → ${OUTPUT}`);
