import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Lottery } from "../target/types/lottery";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

describe("lottery", () => {
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  // Configure the client to use the local cluster.
  anchor.setProvider(provider);
  const wallet = provider.wallet as anchor.Wallet;
  const program = anchor.workspace.Lottery as Program<Lottery>;

  it("Is initialized!", async () => {
    const initConfigIx = await program.methods
      .initializeConfig(
        new anchor.BN(0),
        new anchor.BN(1822712025),
        new anchor.BN(10000)
      )
      .instruction();

    const blockchashWithContext =
      await provider.connection.getLatestBlockhash();
    const tx = new anchor.web3.Transaction({
      blockhash: blockchashWithContext.blockhash,
      lastValidBlockHeight: blockchashWithContext.lastValidBlockHeight,
      feePayer: provider.wallet.publicKey,
    }).add(initConfigIx);
    // Sign the transaction
    tx.sign(wallet.payer);

    // Serialize the transaction
    const serializedTx = tx.serialize();
    const signature = await anchor.web3.sendAndConfirmRawTransaction(
      connection,
      serializedTx,
      // [wallet.payer],
      { skipPreflight: true }
    );
    console.log("Your transaction signature", signature);

    const initLotteryIx = await program.methods.initializeLottery().accounts({
      tokenProgram: TOKEN_PROGRAM_ID,
    });

    const initLotteryTx = new anchor.web3.Transaction({
      blockhash: blockchashWithContext.blockhash,
      lastValidBlockHeight: blockchashWithContext.lastValidBlockHeight,
      feePayer: provider.wallet.publicKey,
    }).add(initLotteryIx);
    initLotteryTx.sign(wallet.payer);
    const serializedTx2 = initLotteryTx.serialize();
    const initLotterySignature = await anchor.web3.sendAndConfirmRawTransaction(
      connection,
      serializedTx2,
      // [wallet.payer],
      { skipPreflight: true }
    );
    console.log(
      "Your init lottery transaction signature",
      initLotterySignature
    );
  });
});
