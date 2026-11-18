import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './WalletPanel.css';

interface WalletPanelProps {
  token: string | null;
}

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const CONTRACT_ABI = ["function subscribe() public payable"];

declare global {
  interface Window { ethereum?: any; }
}

export default function WalletPanel({ token }: WalletPanelProps) {
  const [walletAddress, setWalletAddress] = useState('');//------------------поле адреса кошелька
  const [currentWallet, setCurrentWallet] = useState<string | null>(null);//-адрес кошелька который есть уже в бд
  const [IsSubscription, setIsSubscription] = useState<boolean>(false);//----наличие или отсутствие подписки
  const [PassEndData, setPassEndData] = useState<string | null>(null);//-----дата окончание подписки
  const [message, setMessage] = useState('');//------------------------------сообщение ответа
  const [isBuying, setIsBuying] = useState(false);//-------------------------идет ли процес покупки 

  useEffect(() => {
    if (token) checkStatus();//----------------------------------------------проверка наличия авторизации через токен, useEffect - позволяет выполнять работу на фоне 
  }, [token]);

  const checkStatus = async () => {
    try {
      //---обращение через фетч к запросу на получение информации о кошельке, наличие подписки и ее длительность 
      const response = await fetch("http://localhost:5208/api/birdpass/status", {
        //---передаем токен авторизации
        headers: { 'Authorization': "Bearer " + token }
      });
      //---если статус код который вернул сервер успешный то
      if (response.ok) {
        //---получаем данные в виде json
        const data = await response.json();
        //---записываем адрес кошелька, наличие подписки, дата ее окончания
        setCurrentWallet(data.wallet);
        setIsSubscription(data.hasSubscription);
        setPassEndData(data.expiresAt); 
      }
    } catch (err) {
      console.error(err);
    }
  };
  //---добавление кошелька
  const AddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      //---подлючаемся через фетч к запросу на добавление криптокошелка
      const response = await fetch("http://localhost:5208/api/birdpass/link-wallet", {
        //---тип http запроса это post и передаем токен авторизации
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token 
        },
        //---отправляем запрос, отправляем ключ криптокошелька чтобы привязать к аакаунту
        body: JSON.stringify({ walletAddress: walletAddress }) 
      });

      if (!response.ok) throw new Error('Помилка при додаванні гаманця');
      
      setMessage('Гаманець приьязан!');
      //---чтобы перезагрузить данные о кошельке со стороны фронта и бека
      checkStatus(); 
    } catch (err: any) {
      setMessage(err.message);
    }
  };
  //---функция покупки подписки
  const handleBuySubscription = async () => {
    //---проверка наличия разширения метамаск в браузере
    if (!window.ethereum) {
      alert("MetaMask вісутній!");
      return;
    }

    setIsBuying(true);//--типо флаг который говорит что сейчас идет загрузка покупки в солидити
    setMessage('');

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });//---------------подключение к метамаск и аккаунту который используеться
      const provider = new ethers.BrowserProvider(window.ethereum);//-------------------создание переводчика между рект и метамаск
      const signer = await provider.getSigner();//--------------------------------------типо обьект для создания тразакций
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);//---создание контракта, передаем адресь контракта в блокчейне, инструкцию для общения с ним и обьект для работы с тразакциями

      const tx = await contract.subscribe({ value: ethers.parseEther("0.01") });//-------передаем цену за подписку
      setMessage("Транзакція відправлена! Очікуємо...");
      
      await tx.wait(1, 30000);//-----------------------------------------------------------------ожтдание ответа
      
      setMessage("Подписка оформлена!");
      
      setTimeout(() => checkStatus(), 1000);//--------------------------------------------чтобы обновить данне о подписке в c# и фронте 
      
    } catch (err: any) {
      if (err.code === 'ACTION_REJECTED') setMessage("Відхилено");
      else if(err.code === 'TIMEOUT'){setMessage("завис блокчейн або метамаск"); }
      else { setMessage("Помилка при покупці");}
    } finally {
      setIsBuying(false);
    }
  };

  const SubscribeEndData = (dateStr: string | null) => {
    if (!dateStr) return 0;
    const end = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="wallet-panel">
      <h2 className="wallet-title">Контроль підписки</h2>
      
      {currentWallet ? (
        <div style={{ marginBottom: '20px', fontSize: '14px', wordBreak: 'break-all' }}>
          <strong>Привязанный кошелек:</strong> <br/> {currentWallet}
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: '#666' }}>Гаманець не прив'язан</p>
      )}

      {message && <p style={{ textAlign: 'center', color: 'blue', fontWeight: 'bold' }}>{message}</p>}<form onSubmit={AddWallet} className="wallet-form">
        <input 
          type="text" 
          placeholder="Введіть адрес гаманця (0x...)" 
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          required
          className="wallet-input"
        />
        <button type="submit" className="wallet-btn btn-save">прив'язати / заміниті</button>
      </form>

      <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <button 
          onClick={handleBuySubscription} 
          className="wallet-btn btn-buy" 
          style={{ width: '100%' }}
          disabled={isBuying}
        >
          {isBuying ? 'Очікування MetaMask...' : 'Купити підписку (0.01 ETH)'}
        </button>
      </div>



      {IsSubscription ? (
        <div className="wallet-status status-active">
          Підписка активна ще : {SubscribeEndData(PassEndData)+ 'днів'}
        </div>
      ) : (
        <div className="wallet-status status-inactive">
          Подписки нет
        </div>
      )}
    </div>
  );
}