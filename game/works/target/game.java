import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.SocketAddress;
import java.net.UnknownHostException;
import java.util.Random;

public class game {	 
	public static Card[] cards;
	public static Player[] players;
	public static int myID = 0;
	public static double winRate = 0.5;
	
	static Socket socket;
	static OutputStream os;
	static PrintWriter pw;
	static InputStream is;
	static BufferedReader br;
	
	public static void con(String[] args){
		String serverIP = args[0];
		int serverPort = Integer.parseInt(args[1]);
		String myIP = args[2];
		int myPort = Integer.parseInt(args[3]);
	    myID = Integer.parseInt(args[4]);	
	    
	    
		Boolean isRegisteredBoolean = false;
		int count = 1000;
		while(isRegisteredBoolean == false && count-->0){
			try{
				try{
					socket = new Socket();//此时Socket对象未绑定本地端口, 并且未连接远程服务器
					socket.setReuseAddress(true);//端口重用
					SocketAddress localAddr = new InetSocketAddress(myIP,myPort);
					SocketAddress remoteAddr = new InetSocketAddress(serverIP,serverPort);
					socket.bind(localAddr);//与本地端口绑定
					socket.connect(remoteAddr);//连接远程服务器
					isRegisteredBoolean = true;
				}catch(Exception e){
					System.out.println("registe faile...retry...");
					Thread.sleep(3000);
				}
			}catch(Exception e){
				System.out.println("Sleep faile...");
			}
		}
		
		System.out.println("registe ok!");
	}
	
	
	public static void main(String[] args)   	  
	{  
		
		long startTime=System.currentTimeMillis();   //获取开始时间	
		System.out.println("start to connect...");
	
		try {  
			//1.建立客户端socket连接，指定服务器位置及端口  		    				
			con(args);		 
			System.out.println("stat to get iostream");

			//2.得到socket读写流 
			os=socket.getOutputStream();  
			pw=new PrintWriter(os);//输出流	            	             
			is=socket.getInputStream();
			br=new BufferedReader(new InputStreamReader(is)); //输入流 
			   
			//2.5 文件写，方便调试
			//File file=new File("/home/xujin/output"+ myID +".txt");
			//bf=new BufferedWriter(new PrintWriter(file));
			   
			//3.利用流按照一定的操作，对socket进行读写操作  
			String info="reg: " + myID + " archer \n";  //注册消息Player->Server
			pw.write(info);
			pw.flush();//刷新输出流，使server马上收到该字符串
			   
			
		
		while(true){
	
			//读取服务器发来的消息，注意处理粘包问题
			String title = br.readLine();//此时title为inquire/ 形式	
			
			//判断整个游戏是否over
			if(title.equals("game-over ")){//由于gameover比较特殊，优先处理
				long endTime=System.currentTimeMillis(); //获取结束时间

				System.out.println("程序运行时间： "+(endTime-startTime)+"ms");
				break;
			}
			
			
			//获取消息的类型
			title = title.split("/")[0];//此时title为inquire形式		            	
			String content = "";            	
			//判断一个消息的结尾
			String oneLine;//
			while(!(oneLine = br.readLine()).equals("/"+title+" ")){
				content += oneLine + "\n";
			}
			
			//将服务器发来的消息写到output文件
			//bf.append(num++ + ": "+ title +": "+ content + "\n");
			//bf.flush();
			
				            	
			//识别服务器发来的消息，分类处理
			megProcess(title,content,pw);	                
		}  

		//4.关闭资源 
		//bf.close();
		if(br != null){
			br.close();  
		}
		if(is != null){
			is.close(); 
		}
		if(pw != null){
			pw.close(); 
		} 
		 if(os != null){
			 os.close(); 
		}
		if(socket != null){
			 socket.close(); 
		}
		}catch (UnknownHostException e) {  
			e.printStackTrace();  
		}catch (IOException e) {  
			e.printStackTrace();  
		}finally{
			//do nothing
		}
	}

	private static void megProcess(String title, String content,PrintWriter pw) {
		if(title.equals("inquire")){
    		//处理询问消息 inquire-msg
    		//String myWaza =  "all_in \n";
			String myWaza = processInquire(content);
    		pw.write(myWaza);
			pw.flush();
		}else if(title.equals("seat")){			
			processSeat(content);
		}else if(title.equals("blind")) {
			processBlind(content);
		}else if(title.equals("hold")){
			processHold(content);
		}else if(title.equals("flop")){
			processFlop(content);
		}else if(title.equals("turn")){
			processTurn(content);
		}else if(title.equals("river")){
			processRiver(content);
		}else if(title.equals("showdown")){
			//do nothing
		}else if(title.equals("pot-win")){
			//do nothing
		}
	}

	private static String processInquire(String content) {
		// TODO Auto-generated method stub
		String myWaza = "fold \n";
		String[] playerInfoFront = content.split("\n");
		Boolean isAllin = false;//前面是否有人allin
		int maxJetton = 80;		
		int frontNum = playerInfoFront.length;//前面的人数,第一圈结束会把自己放到最后一行
		int nums = Player.getNums();//总人数
	
		//根据Inquire更新player的状态
		for(int i = 0; i < frontNum - 1;i++){
			String[] onePlayer = playerInfoFront[i].split(" ");
			//onePlayer[0]即Pid
			
			for(int j = 0; j < nums; j++){
				if(onePlayer[0].equals(players[j].getPid() + "")){
					players[j].setJetton(Integer.parseInt(onePlayer[1]));
					players[j].setMoney(Integer.parseInt(onePlayer[2]));
					players[j].setBet(Integer.parseInt(onePlayer[3]));
					players[j].setAction(onePlayer[4]);
					if(onePlayer[4].equals("all_in \n")){
						isAllin = true;		
					}
					
					if(Integer.parseInt(onePlayer[1]) > maxJetton)
						maxJetton = Integer.parseInt(onePlayer[1]);
				}
				
				
			}
			
			
		}
		
		
		
		if(Card.getNums() == 2){
			//pre-flop 0,1两张手牌
			myWaza = actionBaseHold(cards, nums, players, maxJetton);
		}else if(Card.getNums() == 5){
			myWaza = "call \n";
			//flop-round 0,1两张手牌 2，3，4三张翻牌
			myWaza = actionBaseFlop(cards, nums, players, maxJetton);
			/*
			if(getWinRate() < 0.5){
				myWaza = "fold \n";
			}else if(getWinRate() >= 0.5 && getWinRate() < 0.8){
				myWaza = "call \n";
			}else{
				myWaza = "all_in \n";
			}*/	
		}else if(Card.getNums() == 6){
			myWaza = "call \n";
			//turn-round 0,1两张手牌 2，3，4三张翻牌,5一张转牌
		}else{
			myWaza = "call \n";
			//river-found 0,1两张手牌 2，3，4三张翻牌,5一张转牌,6一张河牌
		}
		
		return myWaza;
	}
	
	
	private static String randWaza(){
		String[] arrWaza = {"all_in \n","flod \n","raise 300 \n","call \n","raise 166 \n"};
		Random random = new Random();
		int ran = random.nextInt(5);
		return arrWaza[ran];
	}
	
	
	private static String randWazaNoAllin(){
		String[] arrWaza = {"flod \n","call \n","call \n","call \n","call \n"};
		Random random = new Random();
		int ran = random.nextInt(5);
		return arrWaza[ran];
	}
	
	
	//保守
	private static String randWazaNoFoldNoAllin(){
		String[] arrWaza = {"raise 10 \n","call \n","call \n","call \n"};
		Random random = new Random();
		int ran = random.nextInt(4);
		return arrWaza[ran];
	}
	
	
	private static String actionBaseFlop(Card[] cards, int nums,
			Player[] players, int allinJetton) {
		// TODO Auto-generated method stub
		if(isHavePairInHold(cards)){
			if(isHaveThree(cards)) return "raise 50 \n";
			if(isHavePair(cards)) return "raise 20 \n";
			if(isSuperSuperPoker(cards)) return "raise 100 \n";
			return randWazaNoFoldNoAllin();
		}
		
		
		//手牌AK, 有对子
		if(isSuperSuperPoker(cards) && isHavePair(cards)){
			return "raise 199 \n";
		}
		
		//至少三条
		if(isHaveThree(cards)) return "raise 199 \n";
		
		//手牌和公共牌组成对子
		if(isHavePair(cards)) return randWazaNoFoldNoAllin();
		
		
		
		//
		if(!isHavePairInFlod3(cards) && isHaveFlash4(cards)) return "call \n";
		
		
		
		//同花
		if(isHaveFlash4(cards)) return randWazaNoFoldNoAllin();
		
		
		return randWazaNoAllin();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
	}
	

	//如果有对子，且至少有1个在手牌中
	private static boolean isHavePair(Card[] cards){	
		//int count = 0;
		for(int i = 0; i < 2; i++){
			for(int j = 2; j < 5; j++){
				//0,1 hold, 2,3,4 flop
				if(cards[i].getPoint().equals(cards[j].getPoint())){
					return true;
				}
			}
		}
		
		return false;
	}
	
	private static boolean isHavePairInHold(Card[] cards){
		if(cards[0].getPoint().equals(cards[1].getPoint())){
			return true;
		}
		return false;
	}
	
	//如果有三条或者四条，且这三条至少有一个在hold中
	private static boolean isHaveThree(Card[] cards){
		
		if(cards[0].getPoint().equals(cards[1].getPoint())){
			for(int j = 2; j < 5; j++){
				if(cards[0].getPoint().equals(cards[j].getPoint())){
					return true;
				}
			}
		}else{
			int count = 0;
			for(int i = 0; i < 2; i++){
				count = 0;
				for(int j = 2; j < 5; j++){
					//0,1 hold, 2,3,4 flop
					if(cards[i].getPoint().equals(cards[j].getPoint())){
						count++;
					}
				}
				if(count > 2) return true;
			}
		}
		
		return false;
	}
	
	//如果有同花,4张就好，且同花必须包含自己的两张手牌
	private static boolean isHaveFlash4(Card[] cards){
		
		if(cards[0].getColor().equals(cards[1].getColor())){
			int count = 0;
			for(int i = 2; i < 5; i++){
				if(cards[i].getColor().equals(cards[i].getColor())){
					count++;
				}
			}
			if(count > 3){
				return true;
			}
		}
		
		return false;
	}

	//如果公共牌里面有对子,3张牌里面有一张对子
	private static boolean isHavePairInFlod3(Card[] cards){
		int count = 0;
		String p2 = cards[2].getPoint();
		String p3 = cards[3].getPoint();
		for(int i = 2; i < 5; i++){
			if(p2.equals(cards[i].getPoint())){
				count++;
			}
		}
		if(count > 1) return true;
		
		count = 0;
		for(int i = 2; i < 5; i++){
			if(p3.equals(cards[i].getPoint())){
				count++;
			}
		}
		if(count > 1) return true;
		
		
		return false;
	}
	
	private static double getWinRate() {
		// TODO Auto-generated method stub		
		return winRate ;
	}

	
	private static double calWinRate5Cards(Card[] cards, int playerNum) {
		// TODO Auto-generated method stub
		int winTimes = 0;
		Player[] oppsPlayers = new Player[playerNum - 1]; 
		Player mePlayer = new Player();
		for(int i = 0; i<50; i++){
			//生成playerNum-1个人，每个人2+3=5张		
			
		}
		return 0.6;
	}

	private static String actionBaseHold(Card [] cards, int nums, Player[] players, int maxJetton){
		// TODO Auto-generated method stub	
		
		//如果是很强的牌: AA, KK, QQ / AKs / AKo  [raise]   共68/(52*51)=>2.56% 
		if(isSuperSuperPoker(cards)){
			return "raise 155 \n";
		}
		
		//如果是強牌   [call] 共84种情况  76/(52*51)=>2.86%
		if(isSuperPoker(cards)){
			Random random = new Random();
			int ran = random.nextInt(10);
			if(ran > 7){
				return "call \n";
			}
			return "raise 100 \n";
		
		}
		
		if(isMiddlePoker(cards) && maxJetton < 400){
			return "call \n";
		}
		
		
		//如果人数少于6人，而且是中牌 [call]  共88种 3.32%
		if(Player.getNums() < 6){
			if(isMiddlePoker(cards)){
				return "call \n";
			}
			
			if(isLowPoker(cards)){
				return "call \n";
			}
		}
		

		//如果人数少于5人，而且是投机牌
		if(Player.getNums() < 5){
			if(isLowPoker(cards)){
				return randWazaNoFoldNoAllin();
			}
			
		}
		

		//如果人数少于3人,只要不是坏牌就call，[all_in]
		if(Player.getNums() < 3){
			//如果对方fold,则all_in
			for(int i = 0; i < Player.getNums(); i++){
				if(players[i].getPid() != myID ){
					if(players[i].getAction() == "fold"){
						return "call \n";
					}else if(players[i].getAction() == "call"){
						return "call \n";
					}else if(players[i].getAction() == "all_in"){
						if(isBadPoker(cards)){
							return "fold \n";
						}
					}
					
				}
			}
			
			
			
			if(isBadPoker(cards)){
				return "fold \n";
			}
			
			
			return "raise 300 \n";
			
							
		}	
		
		return "fold \n";
	}
	
	/*
	牌型  个数
	任意  52*51
	AA    4*3
	AKs   4*2
	AKo   4*3*2
	*/
	//很强的牌: AA, KK, QQ ,JJ/ AKs / AKo 
	private static boolean isSuperSuperPoker(Card[] cards){
		String p0 = cards[0].getPoint();
		String p1 = cards[1].getPoint();
		String c0 = cards[0].getColor();
		String c1 = cards[1].getColor();	
		
		if(c0.equals(c1)){
			//同色
			if("AK".contains(p0+p1) || "AK".contains(p1+p0)){				
				return 	true;			
			}
		}else{
			//不同色
			if("AA KK QQ AK KA JJ".contains(p0+p1)){				
				return true;
			}
		}
		
		return false;
	}

	
	//强牌:  10-10, 99 / AQs, AQo, AJs
	private static boolean isSuperPoker(Card[] cards){
		String p0 = cards[0].getPoint();
		String p1 = cards[1].getPoint();
		String c0 = cards[0].getColor();
		String c1 = cards[1].getColor();	
		
		
		if(c0.equals(c1)){
			//同色
			if("AQ QA AJ JA".contains(p0+p1)){				
				return true;				
			}
		}else{
			//不同色
			if("1010 99 AQ QA".contains(p0+p1)){				
				return true;
			}
		}
		
		return false;
	
	}
	
	
	//中牌 AJo, A-10s, A-10o, KQs, KQo
	private static boolean isMiddlePoker(Card[] cards){
		String p0 = cards[0].getPoint();
		String p1 = cards[1].getPoint();
		String c0 = cards[0].getColor();
		String c1 = cards[1].getColor();	
		
		
		if(c0.equals(c1)){
			//同色
			if("A10 10A KQ QK".contains(p0+p1)){				
				return true;				
			}
		}else{
			//不同色
			if("AJ JA A10 10A KQ QK".contains(p0+p1)){				
				return true;
			}
		}
		
		return false;
	
	}
	
	
	//强投机牌，从88 到22 /KJs, K-10s, QJs, Q-10s, J-10s, 10-9s
	private static boolean isLowPoker(Card[] cards){
		String p0 = cards[0].getPoint();
		String p1 = cards[1].getPoint();
		String c0 = cards[0].getColor();
		String c1 = cards[1].getColor();	
		
		
		if(c0.equals(c1)){
			//同色
			if("22 33 44 55 66 77 88 KJ JK K10 10K QJ JQ Q10 10Q J10 10J 109 910 9Q Q9".contains(p0+p1)){				
				return true;				
			}			
		}else{
			//不同色
			if("88 77 66 55 44 33 22".contains(p0+p1)){				
				return true;
			}
		}
		
		return false;
	
	}
	
	//坏牌
	private static boolean isBadPoker(Card[] cards){
		String p0 = cards[0].getPoint();
		String p1 = cards[1].getPoint();
		String c0 = cards[0].getColor();
		String c1 = cards[1].getColor();	
		
		if(!c0.equals(c1)){
			if("23456789".contains(p0) && "23456789".contains(p1) && !p1.equals(p0)){
				return true;
			}
		}
		
		return false;
	
	}
	
	


	private static void processRiver(String content) {
		// TODO Auto-generated method stub
		String[] sts = content.split(" ");

		cards[6] = new Card();
		cards[6].setColor(sts[0]);
		cards[6].setPoint(sts[1]);
		
		Card.numsPlus();
	}

	private static void processTurn(String content) {
		// TODO Auto-generated method stub
		String[] sts = content.split(" ");

		cards[5] = new Card();
		cards[5].setColor(sts[0]);
		cards[5].setPoint(sts[1]);
		
		Card.numsPlus();
	}

	private static void processFlop(String content) {
		// TODO Auto-generated method stub
		String[] sts = content.split(" \n| ");

		cards[2] = new Card();
		cards[2].setColor(sts[0]);
		cards[2].setPoint(sts[1]);
		
		cards[3] = new Card();
		cards[3].setColor(sts[2]);
		cards[3].setPoint(sts[3]);
		
		cards[4] = new Card();
		cards[4].setColor(sts[4]);
		cards[4].setPoint(sts[5]);
		
		Card.numsPlus();
		Card.numsPlus();
		Card.numsPlus();
		
		

		//之后模拟对手的牌，求胜率
		winRate = calWinRate5Cards(cards, Player.getNums());
		
		
	}

	private static void processHold(String content) {
		//System.out.println("处理hold");
		// TODO Auto-generated method stub
		String[] sts = content.split(" \n| ");
		
		cards[0] = new Card();
		cards[0].setColor(sts[0]);
		cards[0].setPoint(sts[1]);
		Card.numsPlus();
		
		cards[1] = new Card();
		cards[1].setColor(sts[2]);
		cards[1].setPoint(sts[3]);
		Card.numsPlus();
		
	}

	private static void processBlind(String content) {
		// TODO Auto-generated method stub
		//System.out.println("处理blind");
	}

		
	//把所有的玩家的信息都写入players
	private static void processSeat(String content) {
		// TODO Auto-generated method stub
		//System.out.println("处理seat");
		
		
		Card.resetNums();
		Player.resetNums();
		cards = new Card[7];//7张牌
		players = new Player[8];//inquire里面最多8个动作，最前面是上一个对手的
		
		String[] playerInfo = content.split("\n"); 
		for(int i = 0; i < playerInfo.length;i++){
			players[i] = new Player();
			Player.playerPlus();
			String[] onePlayer = playerInfo[i].split(" ");
			if(onePlayer[0].equals("button:")){
				//button
				players[i].setLocation("button:");
				players[i].setPid(Integer.parseInt(onePlayer[1]));
				players[i].setJetton(Integer.parseInt(onePlayer[2]));
				players[i].setMoney(Integer.parseInt(onePlayer[3]));
			}else if(onePlayer[0].equals("small")){
				//small button
				players[i].setLocation("small");
				players[i].setPid(Integer.parseInt(onePlayer[2]));
				players[i].setJetton(Integer.parseInt(onePlayer[3]));
				players[i].setMoney(Integer.parseInt(onePlayer[4]));
			}else if(onePlayer[0].equals("big")){
				//big button
				players[i].setLocation("big");
				players[i].setPid(Integer.parseInt(onePlayer[2]));
				players[i].setJetton(Integer.parseInt(onePlayer[3]));
				players[i].setMoney(Integer.parseInt(onePlayer[4]));
			}else{
				players[i].setLocation(""+i);//从3开始
				players[i].setPid(Integer.parseInt(onePlayer[0]));
				players[i].setJetton(Integer.parseInt(onePlayer[1]));
				players[i].setMoney(Integer.parseInt(onePlayer[2]));
			}
			
			
			
		}

		
	}	 	  		   
	}





class Card {
	public String color;
	public String point;
	public static int nums = 0;//已知的card的总数
	
	String[] COLORS = {"SPADES","HEARTS","CLUBS","DIAMONDS"};
	String[] PointStrings = {"2","3","4","5","6","7","8","9","10","J","Q","K","A"};
	public Card(){}
	public Card(String rand){
		//随机生成一个Card
		Random random = new Random();
		
		this.color = COLORS[random.nextInt(4)];
		this.point = PointStrings[random.nextInt(13)];
		
	}
	
	public static void numsPlus(){
		nums++;
	}
	
	public static void resetNums(){
		nums = 0;
	}
	public static int getNums(){
		return nums;
	}
	public String getColor() {
		return color;
	}
	public void setColor(String color) {
		this.color = color;
	}
	public String getPoint() {
		return point;
	}
	public void setPoint(String point) {
		this.point = point;
	}
}



class Player {
	public int pid;
	public int jetton;
	public int money;
	public int bet;
	public static int nums = 0;//有效player的总数	
	public String action;
	public String location; //位置 button,small,big,3,4,5,6,7
	
	public Card[] cards = new Card[7];
	
	
	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	public Player(){
		
	}
	
	public static void playerPlus(){
		nums++;
	}
	
	public static void resetNums(){
		nums = 0;
	}
	
	public static int getNums(){
		return nums;
	}
	public int getPid() {
		return pid;
	}
	public void setPid(int pid) {
		this.pid = pid;
	}
	public int getJetton() {
		return jetton;
	}
	public void setJetton(int jetton) {
		this.jetton = jetton;
	}
	public int getMoney() {
		return money;
	}
	public void setMoney(int money) {
		this.money = money;
	}
	public int getBet() {
		return bet;
	}
	public void setBet(int bet) {
		this.bet = bet;
	}
	public String getAction() {
		return action;
	}
	public void setAction(String action) {
		this.action = action;
	}
	
	
}
