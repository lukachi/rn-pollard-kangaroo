import { TwistedEd25519PrivateKey, TwistedElGamal } from "@aptos-labs/ts-sdk";
import { useState } from "react";
import { Button, SafeAreaView, ScrollView, Text, View } from "react-native";
import { initializeKangaroo, solveDLP } from "rn-pollard-kangaroo";

import "react-native-get-random-values";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const preloadTables = async () => {
    setIsSubmitting(true);

    try {
      await initializeKangaroo([16, 32, 48]);

      TwistedElGamal.setDecryptionFn(async (pk) =>
        BigInt(await solveDLP(pk, [10, 100, 10_000])),
      );

      setIsInitialized(true);
    } catch (error) {
      console.log(error);
    }

    setIsSubmitting(false);
  };

  const test16 = async () => {
    setIsSubmitting(true);

    try {
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
        <View style={{ width: "100%", height: 2, backgroundColor: "grey" }} />
        <Text style={{ color: "black", marginHorizontal: "auto" }}>WASM</Text>
        <View style={{ width: "100%", height: 2, backgroundColor: "grey" }} />
        <Button
          onPress={preloadTables}
          title="preload tables"
          disabled={isInitialized || isSubmitting}
        />
        <Button
          onPress={test16}
          title="Run Test 16"
          disabled={!isInitialized || isSubmitting}
        />
        <Button
          onPress={test32}
          title="Run Test 32"
          disabled={!isInitialized || isSubmitting}
        />
        <Button
          onPress={test48}
          title="Run Test 48"
          disabled={!isInitialized || isSubmitting}
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
