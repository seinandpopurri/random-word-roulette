import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

const words: Record<"A" | "B" | "C", string[]> = {
  A: [
    "흔들리다",
    "곤충",
    "미끌미끌",
    "파닥파닥",
    "돌",
    "괴물",
    "책",
    "나무",
    "잠자다",
    "춤추다",
  ],
  B: [
    "부서지다",
    "쿵",
    "사람",
    "느릿느릿",
    "뒤집히다",
    "늦다",
    "과일",
    "자르다",
    "꿈",
    "잇다",
  ],
  C: [
    "모이다",
    "대화하다",
    "벽",
    "소리",
    "와글와글",
    "태양",
    "물",
    "집",
    "덩어리",
    "매듭",
  ],
};

type Category = "A" | "B" | "C";

type RecordEntry = {
  id: string;
  name: string;
  A: string;
  B: string;
  C: string;
};

export default function App() {
  const [currentWord, setCurrentWord] = useState<Record<Category, string>>({
    A: "A",
    B: "B",
    C: "C",
  });
  const [isSpinning, setIsSpinning] = useState<Record<Category, boolean>>({
    A: false,
    B: false,
    C: false,
  });
  const [name, setName] = useState("");
  const [records, setRecords] = useState<RecordEntry[]>([]);
  const tableRef = useRef<HTMLDivElement>(null);

  const recordsCollection = collection(db, "records");

  useEffect(() => {
    const unsubscribe = onSnapshot(recordsCollection, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as RecordEntry[];
      setRecords(data);
    });

    return () => unsubscribe();
  }, []);

  const spinCategory = (category: Category) => {
    if (isSpinning[category]) return;
    setIsSpinning((prev) => ({ ...prev, [category]: true }));
    let count = 0;
    const maxCount = 30 + Math.floor(Math.random() * 20);
    const interval = setInterval(() => {
      setCurrentWord((prev) => ({
        ...prev,
        [category]: words[category][Math.floor(Math.random() * 10)],
      }));
      count++;
      if (count >= maxCount) {
        clearInterval(interval);
        setIsSpinning((prev) => ({ ...prev, [category]: false }));
      }
    }, 50);
  };

  const getBackgroundColor = (category: Category) => {
    switch (category) {
      case "A":
        return "#009e61";
      case "B":
        return "#ff6464";
      case "C":
        return "#007aff";
      default:
        return "#eee";
    }
  };

  const handleOK = async () => {
    if (name.trim() === "") return;
    const newEntry = { name, ...currentWord };
    await addDoc(recordsCollection, newEntry); // Firestore에만 추가

    setName("");
    setCurrentWord({ A: "A", B: "B", C: "C" });
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleReset = async () => {
    const pw = prompt("비밀번호를 입력하세요");
    if (pw !== "1515") return alert("비밀번호가 틀렸습니다.");

    for (const record of records) {
      await deleteDoc(doc(db, "records", record.id));
    }
    setRecords([]);
  };

  return (
    <div
      className="w-screen min-h-screen text-white font-bold"
      style={{ backgroundColor: "#d5ff3e" }}
    >
      {/* 첫 화면 전체 */}
      <div className="h-screen flex flex-col">
        {/* 이름 입력칸 */}
        <div
          className="flex justify-center items-center"
          style={{
            backgroundColor: "#dda680",
            height: "15%",
            minHeight: "64px",
          }}
        >
          <input
            className="text-center text-4xl bg-transparent border-none outline-none w-1/2 text-white placeholder-white animated-caret"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* ABC 룰렛 */}
        <div className="flex md:h-[70%] h-[55%]">
          {(["A", "B", "C"] as Category[]).map((cat) => (
            <div
              key={cat}
              onClick={() => spinCategory(cat)}
              className="flex-1 flex justify-center items-center cursor-pointer transition duration-300"
              style={{ backgroundColor: getBackgroundColor(cat) }}
            >
              <div className="text-5xl sm:text-7xl md:text-8xl lg:text-8xl tracking-wider text-white text-center">
                {currentWord[cat]}
              </div>
            </div>
          ))}
        </div>

        {/* OK 버튼 */}
        <div
          className="flex justify-center items-center"
          style={{
            backgroundColor: "#933eaf",
            height: "15%",
            minHeight: "64px",
          }}
        >
          <button
            className="text-center text-4xl bg-transparent border-none outline-none w-1/2 text-white placeholder-white caret-white"
            onClick={handleOK}
          >
            ok
          </button>
        </div>
      </div>

      {/* 기록 테이블 */}
      <div
        ref={tableRef}
        className="bg-transparent text-black px-6 py-10"
        style={{ backdropFilter: "blur(4px)", backgroundColor: "transparent" }}
      >
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-1/4" />
            <col className="w-1/4" />
            <col className="w-1/4" />
            <col className="w-1/4" />
          </colgroup>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="text-center border-t border-black">
                <td className="py-2 text-lg">{r.name}</td>
                <td className="py-2 text-lg">{r.A}</td>
                <td className="py-2 text-lg">{r.B}</td>
                <td className="py-2 text-lg">{r.C}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="w-full flex justify-center mt-4">
          <button
            className="bg-transparent text-black text-m border-none outline-none hover:opacity-70"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
