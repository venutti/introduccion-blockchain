const sdk = /** @type {import("stellar-sdk")} */ (window.StellarSdk);

const { Keypair, Server } = sdk;

const server = new Server("https://horizon-testnet.stellar.org");

function showRandomKeypair() {
  const keypair = Keypair.random();

  console.log(keypair);

  document.querySelector("#public-key").textContent = keypair.publicKey();
  document.querySelector("#secret-key").textContent = keypair.secret();
}

async function fundAccountWithFriendbot() {
  const publicKey = document.getElementById("public-key").textContent;

  if (!publicKey) return;

  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    const responseJSON = await response.json();
    console.log("SUCCESS! You have a new account :)\n", responseJSON);
  } catch (e) {
    console.error("ERROR!", e);
  }
}

document
  .getElementById("generate-keypair")
  .addEventListener("click", showRandomKeypair);

document
  .getElementById("fund-account")
  .addEventListener("click", fundAccountWithFriendbot);
