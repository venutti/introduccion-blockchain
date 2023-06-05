// esto es simplemente para obtener los tipos
const sdk = /** @type {import("stellar-sdk")} */ (window.StellarSdk);

const { Keypair, Asset, Server, TransactionBuilder, Operation } = sdk;
const server = new Server("https://horizon-testnet.stellar.org");
// esto nunca se hace!! es sólo de ejemplo. El frontend siempre crea transacciones SIN firmar.
// Y luego se las envía a un servidor que tiene las llaves aseguradas para firmar.
// GCDGX6WQSEIP2XZAV6XYQQE7QBOYGMJTW3EOP3GNH7VHO2BBFCHLPFF2
const userAKeyPair = Keypair.fromSecret(
  "SD2KJUR2KP53ZRDHJ5AA2AQGVZXJCU4XSETV675QWJECH2V5GUY5ZVGC"
);
// GDH2YMRAUVA7AGP6OIJY4GJWYSYWFMAUOTBUJKLEB6GA3A6SMUAOK6LC
const userBKeyPair = Keypair.fromSecret(
  "SD2CMCDT36G2A2P7WTRH3UVVW6MIEBXVO5RHEMTHO27ISRCNJMIZMNAV"
);

async function loadBalances() {
  // Prestar atención a lo que pasa en el network tab
  const accountA = await server.loadAccount(userAKeyPair.publicKey());
  const accountB = await server.loadAccount(userBKeyPair.publicKey());

  const xlmBalanceA = accountA.balances
    .filter((balance) => balance.asset_type === Asset.native().getAssetType())
    .pop();
  const xlmBalanceB = accountB.balances
    .filter((balance) => balance.asset_type === Asset.native().getAssetType())
    .pop();

  console.log(xlmBalanceA, xlmBalanceB);
  document.querySelector("#balance-a").textContent = xlmBalanceA.balance;
  document.querySelector("#balance-b").textContent = xlmBalanceB.balance;
}

async function makePayment() {
  const sourceAccount = await server.loadAccount(userAKeyPair.publicKey());

  // el SOURCE ACCOUNT de una transacción es el SOURCE ACCOUNT de cada operación por default
  // cada operación puede tener un source distinto (en el próximo ejemplo lo vemos)

  // el SOURCE ACCOUNT sirve para obtener el SEQUENCE NUMBER, que incrementa de 1 en 1.
  // Si hay 2 transacciones de la misma cuenta con el mismo SEQUENCE NUMBER, sólo 1 puede ser enviada y la otra es considerada inválida.
  // También, quien construye la transacción, paga los fees de la red.
  console.log(sourceAccount.sequenceNumber());

  // Una transacción puede tener hasta 100 operaciones dentro. Cada operación paga un fee.
  const tx = new TransactionBuilder(sourceAccount, {
    // con esto obtenemos los fees de la red. Si la red está congestionada y no enviamos suficientes fees, entonces nuestra transacción puede fallar.
    // más en https://horizon-testnet.stellar.org/fee_stats
    fee: await server.fetchBaseFee(),
    networkPassphrase: "Test SDF Network ; September 2015",
  })
    .addOperation(
      Operation.payment({
        amount: "1",
        asset: Asset.native(),
        destination: userBKeyPair.publicKey(),
      })
    )
    .setTimeout(60 * 10) //10 minutos, luego la tx falla
    .build();

  console.log(tx.toXDR());

  tx.sign(userAKeyPair);

  try {
    const txResult = await server.submitTransaction(tx);
    console.log(txResult);
    loadBalances();
  } catch (e) {
    console.error(e);
  }
}

document
  .querySelector("#load-balances")
  .addEventListener("click", loadBalances);
document.querySelector("#make-payment").addEventListener("click", makePayment);
