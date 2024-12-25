import {
  bytesToBigIntLE,
  TwistedEd25519PrivateKey,
  TwistedElGamal,
} from "@aptos-labs/ts-sdk";
import { useState } from "react";
import { Button, SafeAreaView, ScrollView } from "react-native";
import { initializeKangaroo, solveDLP } from "rn-pollard-kangaroo";

import "react-native-get-random-values";

type TableMap = {
  file_name: string;
  s: string[];
  slog: string[];
  table: {
    point: string;
    value: string;
  }[];
};

export async function loadTableMapJSON(url: string): Promise<TableMap> {
  const tableMapResponse = await fetch(url);

  if (!tableMapResponse.ok) {
    throw new TypeError("Failed to load table map");
  }

  return tableMapResponse.json();
}

function generateRandomInteger(bits: number): bigint {
  // eslint-disable-next-line no-bitwise
  const max = (1n << BigInt(bits)) - 1n;
  const randomValue = BigInt(Math.floor(Math.random() * (Number(max) + 1)));

  return randomValue;
}

const execution = async (
  bitsAmount: 16 | 32 | 48,
  length = 50,
): Promise<{
  randBalances: bigint[];
  results: { result: bigint; elapsedTime: number }[];
}> => {
  const randBalances = Array.from({ length }, () =>
    generateRandomInteger(bitsAmount),
  );

  const decryptedAmounts: { result: bigint; elapsedTime: number }[] = [];

  for (const balance of randBalances) {
    const newAlice = TwistedEd25519PrivateKey.generate();

    const encryptedBalance = TwistedElGamal.encryptWithPK(
      balance,
      newAlice.publicKey(),
    );

    const startMainTime = performance.now();
    const decryptedBalance = await TwistedElGamal.decryptWithPK(
      encryptedBalance,
      newAlice,
    );
    const endMainTime = performance.now();

    const elapsedMainTime = endMainTime - startMainTime;

    decryptedAmounts.push({
      result: decryptedBalance,
      elapsedTime: elapsedMainTime,
    });
  }

  const averageTime =
    decryptedAmounts.reduce((acc, { elapsedTime }) => acc + elapsedTime, 0) /
    decryptedAmounts.length;

  const lowestTime = decryptedAmounts.reduce(
    (acc, { elapsedTime }) => Math.min(acc, elapsedTime),
    Infinity,
  );
  const highestTime = decryptedAmounts.reduce(
    (acc, { elapsedTime }) => Math.max(acc, elapsedTime),
    0,
  );

  console.log(
    `Pollard kangaroo(table ${bitsAmount}):\n`,
    `Average time: ${averageTime} ms\n`,
    `Lowest time: ${lowestTime} ms\n`,
    `Highest time: ${highestTime} ms`,
  );

  return {
    randBalances,
    results: decryptedAmounts,
  };
};

export default function App() {
  const [kangarooTable16, setKangarooTable16] = useState<TableMap>();
  const [kangarooTable32, setKangarooTable32] = useState<TableMap>();
  const [kangarooTable48, setKangarooTable48] = useState<TableMap>();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const preloadTables = async () => {
    setIsSubmitting(true);

    const [table16, table32, table48] = await Promise.all([
      loadTableMapJSON(
        "https://raw.githubusercontent.com/distributed-lab/pollard-kangaroo-plus-testing/refs/heads/tables/output_8_8000_16_64.json",
      ),
      loadTableMapJSON(
        "https://raw.githubusercontent.com/distributed-lab/pollard-kangaroo-plus-testing/refs/heads/tables/output_2048_4000_32_128.json",
      ),
      loadTableMapJSON(
        "https://raw.githubusercontent.com/distributed-lab/pollard-kangaroo-plus-testing/refs/heads/tables/output_65536_40000_48_128.json",
      ),
    ]);

    setKangarooTable16(table16);
    setKangarooTable32(table32);
    setKangarooTable48(table48);

    setIsSubmitting(false);
  };

  const test16 = async () => {
    setIsSubmitting(true);

    try {
      await initializeKangaroo(
        JSON.stringify(kangarooTable16),
        8000n,
        8n,
        64n,
        16,
      );
      TwistedElGamal.setDecryptionFn(async (pk) => solveDLP(pk));

      const { randBalances, results } = await execution(16);

      console.log(
        results.every(({ result }, idx) => randBalances[idx] === result),
      );
    } catch (error) {
      console.error(error);
    }

    setIsSubmitting(false);
  };

  const test32 = async () => {
    setIsSubmitting(true);

    try {
      await initializeKangaroo(
        JSON.stringify(kangarooTable32),
        4000n,
        2048n,
        128n,
        32,
      );
      TwistedElGamal.setDecryptionFn(async (pk) => solveDLP(pk));

      const { randBalances, results } = await execution(32);

      console.log(
        results.every(({ result }, idx) => randBalances[idx] === result),
      );
    } catch (error) {
      console.error(error);
    }

    setIsSubmitting(false);
  };

  const test48 = async () => {
    setIsSubmitting(true);

    try {
      await initializeKangaroo(
        JSON.stringify(kangarooTable48),
        40_000n,
        65536n,
        128n,
        48,
      );
      TwistedElGamal.setDecryptionFn(async (pk) => solveDLP(pk));

      const { randBalances, results } = await execution(48);

      console.log(
        results.every(({ result }, idx) => randBalances[idx] === result),
      );
    } catch (error) {
      console.error(error);
    }

    setIsSubmitting(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <Button
          onPress={preloadTables}
          title="preload tables"
          disabled={
            Boolean(kangarooTable16 && kangarooTable32 && kangarooTable48) ||
            isSubmitting
          }
        />
        <Button
          onPress={test16}
          title="Run Test 16"
          disabled={!kangarooTable16 || isSubmitting}
        />
        <Button
          onPress={test32}
          title="Run Test 32"
          disabled={!kangarooTable32 || isSubmitting}
        />
        <Button
          onPress={test48}
          title="Run Test 48"
          disabled={!kangarooTable48 || isSubmitting}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  header: {
    fontSize: 30,
    margin: 20,
  },
  groupHeader: {
    fontSize: 20,
    marginBottom: 20,
  },
  group: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#eee",
  },
  view: {
    flex: 1,
    height: 200,
  },
};
