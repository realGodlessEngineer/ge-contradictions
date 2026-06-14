/**
 * Initialize Sample Database
 * Creates a test database with sample contradictions
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

async function createSampleDatabase() {
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    
    // Create tables
    db.run(`
        CREATE TABLE contradictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            question_url TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    db.run(`
        CREATE TABLE answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contradiction_id INTEGER NOT NULL,
            answer TEXT NOT NULL,
            answer_explanation TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contradiction_id) REFERENCES contradictions(id)
        )
    `);
    
    db.run(`
        CREATE TABLE bible_references (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            answer_id INTEGER NOT NULL,
            reference TEXT NOT NULL,
            FOREIGN KEY (answer_id) REFERENCES answers(id)
        )
    `);
    
    // Sample contradictions
    const contradictions = [
        {
            question: "Who was Joseph's father?",
            url: "https://skepticsannotatedbible.com/contra/josephsfather.html",
            answers: [
                { answer: "Jacob", explanation: "Matthew says Jacob was Joseph's father", refs: ["Matthew 1:16"] },
                { answer: "Heli", explanation: "Luke says Heli was Joseph's father", refs: ["Luke 3:23"] }
            ]
        },
        {
            question: "How many generations were there from Abraham to Jesus?",
            url: "https://skepticsannotatedbible.com/contra/generations.html",
            answers: [
                { answer: "42 generations", explanation: "Matthew claims 42 generations", refs: ["Matthew 1:17"] },
                { answer: "More than 42", explanation: "Luke lists more than 42 generations", refs: ["Luke 3:23-38"] }
            ]
        },
        {
            question: "Who incited David to count Israel?",
            url: "https://skepticsannotatedbible.com/contra/incited.html",
            answers: [
                { answer: "God (the LORD)", explanation: "Samuel says God incited David", refs: ["2 Samuel 24:1"] },
                { answer: "Satan", explanation: "Chronicles says Satan provoked David", refs: ["1 Chronicles 21:1"] }
            ]
        },
        {
            question: "How old was Ahaziah when he began to reign?",
            url: "https://skepticsannotatedbible.com/contra/ahaziah.html",
            answers: [
                { answer: "22 years old", explanation: "Kings says he was 22", refs: ["2 Kings 8:26"] },
                { answer: "42 years old", explanation: "Chronicles says he was 42", refs: ["2 Chronicles 22:2"] }
            ]
        },
        {
            question: "How did Judas die?",
            url: "https://skepticsannotatedbible.com/contra/judas.html",
            answers: [
                { answer: "He hanged himself", explanation: "Matthew describes a hanging", refs: ["Matthew 27:5"] },
                { answer: "He fell headlong and burst open", explanation: "Acts describes him falling and his bowels gushing out", refs: ["Acts 1:18"] }
            ]
        },
        {
            question: "What did Jesus say about bearing witness to himself?",
            url: "https://skepticsannotatedbible.com/contra/witness.html",
            answers: [
                { answer: "His witness is true", explanation: "Jesus claims his own witness is valid", refs: ["John 8:14"] },
                { answer: "His witness is not true", explanation: "Jesus says if he bears witness of himself it's not true", refs: ["John 5:31"] }
            ]
        },
        {
            question: "Where was Jesus at the sixth hour on crucifixion day?",
            url: "https://skepticsannotatedbible.com/contra/sixthhour.html",
            answers: [
                { answer: "On the cross", explanation: "Mark says Jesus was crucified at the third hour and darkness came at sixth hour", refs: ["Mark 15:25", "Mark 15:33"] },
                { answer: "Before Pilate", explanation: "John says at the sixth hour Pilate was still presenting Jesus to the crowd", refs: ["John 19:14"] }
            ]
        },
        {
            question: "Did Jesus carry his own cross?",
            url: "https://skepticsannotatedbible.com/contra/cross.html",
            answers: [
                { answer: "Yes, he bore his own cross", explanation: "John says Jesus carried his own cross", refs: ["John 19:17"] },
                { answer: "No, Simon carried it", explanation: "The synoptic gospels say Simon of Cyrene was compelled to carry it", refs: ["Matthew 27:32", "Mark 15:21", "Luke 23:26"] }
            ]
        },
        {
            question: "What were Jesus' last words?",
            url: "https://skepticsannotatedbible.com/contra/lastwords.html",
            answers: [
                { answer: "My God, my God, why hast thou forsaken me?", explanation: "Matthew and Mark record this as Jesus' final cry", refs: ["Matthew 27:46", "Mark 15:34"] },
                { answer: "Father, into thy hands I commend my spirit", explanation: "Luke records these as Jesus' last words", refs: ["Luke 23:46"] },
                { answer: "It is finished", explanation: "John says Jesus said 'It is finished' before dying", refs: ["John 19:30"] }
            ]
        },
        {
            question: "Who first came to Jesus' tomb?",
            url: "https://skepticsannotatedbible.com/contra/tomb.html",
            answers: [
                { answer: "Mary Magdalene alone", explanation: "John says Mary came alone while it was still dark", refs: ["John 20:1"] },
                { answer: "Two Marys", explanation: "Matthew says Mary Magdalene and 'the other Mary' came", refs: ["Matthew 28:1"] },
                { answer: "Three women", explanation: "Mark says three women came including Salome", refs: ["Mark 16:1"] },
                { answer: "At least five women", explanation: "Luke mentions several women including Joanna", refs: ["Luke 24:10"] }
            ]
        },
        {
            question: "When was Jesus crucified?",
            url: "https://skepticsannotatedbible.com/contra/crucified.html",
            answers: [
                { answer: "The third hour (9 AM)", explanation: "Mark says it was the third hour when they crucified him", refs: ["Mark 15:25"] },
                { answer: "After the sixth hour (noon)", explanation: "John says it was about the sixth hour when Pilate said 'Behold your King'", refs: ["John 19:14-16"] }
            ]
        },
        {
            question: "How many angels were at Jesus' tomb?",
            url: "https://skepticsannotatedbible.com/contra/angels.html",
            answers: [
                { answer: "One angel", explanation: "Matthew describes one angel rolling away the stone", refs: ["Matthew 28:2"] },
                { answer: "Two angels", explanation: "John describes two angels sitting where Jesus had lain", refs: ["John 20:12"] }
            ]
        },
        // Jesus-specific contradictions for Jesus mode
        {
            question: "Was Jesus all-knowing (omniscient)?",
            url: "https://skepticsannotatedbible.com/contra/omniscient.html",
            answers: [
                { answer: "Yes, Jesus knew all things", explanation: "John claims Jesus knew all things", refs: ["John 16:30", "John 21:17"] },
                { answer: "No, Jesus did not know the day or hour", explanation: "Jesus himself said he didn't know when the end would come", refs: ["Mark 13:32"] }
            ]
        },
        {
            question: "Is Jesus equal to God the Father?",
            url: "https://skepticsannotatedbible.com/contra/equal.html",
            answers: [
                { answer: "Yes, Jesus and the Father are equal/one", explanation: "Jesus claims equality with God", refs: ["John 10:30", "John 14:9"] },
                { answer: "No, the Father is greater", explanation: "Jesus says the Father is greater than he", refs: ["John 14:28", "John 10:29"] }
            ]
        },
        {
            question: "Did Jesus come to bring peace?",
            url: "https://skepticsannotatedbible.com/contra/peace.html",
            answers: [
                { answer: "Yes, Jesus is the Prince of Peace", explanation: "Isaiah prophesies a Prince of Peace, angels announce peace", refs: ["Isaiah 9:6", "Luke 2:14"] },
                { answer: "No, Jesus came to bring division", explanation: "Jesus says he came not to bring peace but a sword", refs: ["Matthew 10:34", "Luke 12:51"] }
            ]
        },
        {
            question: "Can anyone see Jesus after death?",
            url: "https://skepticsannotatedbible.com/contra/see.html",
            answers: [
                { answer: "Many people saw Jesus after resurrection", explanation: "The Gospels describe multiple appearances", refs: ["Matthew 28:9", "John 20:14", "1 Corinthians 15:6"] },
                { answer: "No one can see Jesus (God)", explanation: "No one has seen God at any time", refs: ["John 1:18", "1 Timothy 6:16"] }
            ]
        },
        {
            question: "Did Jesus say the Pharisees' judgment was wrong?",
            url: "https://skepticsannotatedbible.com/contra/judge.html",
            answers: [
                { answer: "Yes, Jesus judged the Pharisees", explanation: "Jesus frequently condemned and judged the Pharisees", refs: ["Matthew 23:13-33", "John 8:44"] },
                { answer: "No, Jesus came not to judge", explanation: "Jesus says he came not to judge the world", refs: ["John 12:47", "John 3:17"] }
            ]
        },
        {
            question: "Was Jesus the only one to ascend to heaven?",
            url: "https://skepticsannotatedbible.com/contra/ascend.html",
            answers: [
                { answer: "Yes, only Jesus ascended", explanation: "Jesus says no man has ascended to heaven except himself", refs: ["John 3:13"] },
                { answer: "No, others ascended too", explanation: "Elijah was taken up to heaven in a whirlwind", refs: ["2 Kings 2:11", "Genesis 5:24"] }
            ]
        },
        {
            question: "Was Jesus tempted?",
            url: "https://skepticsannotatedbible.com/contra/tempted.html",
            answers: [
                { answer: "Yes, Jesus was tempted", explanation: "The Gospels describe Satan tempting Jesus", refs: ["Matthew 4:1", "Hebrews 4:15"] },
                { answer: "God cannot be tempted", explanation: "James says God cannot be tempted by evil", refs: ["James 1:13"] }
            ]
        },
        {
            question: "Did Jesus always tell the truth?",
            url: "https://skepticsannotatedbible.com/contra/truth.html",
            answers: [
                { answer: "Yes, Jesus is the truth", explanation: "Jesus claims to be the way, truth, and life", refs: ["John 14:6"] },
                { answer: "Jesus said he wasn't going to the feast, then went secretly", explanation: "Jesus told his brothers he wasn't going to the feast, then went in secret", refs: ["John 7:8-10"] }
            ]
        }
    ];
    
    // Insert data
    contradictions.forEach(c => {
        db.run(
            'INSERT INTO contradictions (question, question_url) VALUES (?, ?)',
            [c.question, c.url]
        );
        
        const contradictionId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
        
        c.answers.forEach(a => {
            db.run(
                'INSERT INTO answers (contradiction_id, answer, answer_explanation) VALUES (?, ?, ?)',
                [contradictionId, a.answer, a.explanation]
            );
            
            const answerId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
            
            a.refs.forEach(ref => {
                db.run(
                    'INSERT INTO bible_references (answer_id, reference) VALUES (?, ?)',
                    [answerId, ref]
                );
            });
        });
    });
    
    // Save database
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(path.join(__dirname, '..', 'contradictions.db'), buffer);
    
    console.log('Sample database created successfully!');
    console.log(`Total contradictions: ${contradictions.length}`);
    
    db.close();
}

createSampleDatabase().catch(console.error);