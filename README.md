# Sneaky

This is a Full stack web application that allows users to share their secrets without revealing their identity.

## It uses following modules -

* express-session
>an HTTP server-side framework used to create and manage a session middleware. 

* passport
>Passport is authentication middleware for Node.js. Extremely flexible and modular, Passport can be unobtrusively dropped in to any Express-based web application. A comprehensive set of strategies support authentication using a username and password, Facebook, Twitter, and more.

* passport-google-oauth20
>This module lets you authenticate using Google in your Node.js applications. By plugging into Passport, Google authentication can be easily and unobtrusively integrated into any application or framework that supports Connect-style middleware, including Express.

* passport-facebook
>This module lets you authenticate using Facebook in your Node.js applications. By plugging into Passport, Facebook authentication can be easily and unobtrusively integrated into any application or framework that supports Connect-style middleware, including Express.

#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <map>


using namespace std;


struct Macro {
    string name;
    vector<string> arguments;
    string body;
};


map<string, int> macroNameTable;
vector<Macro> macroDefinitionTable;
vector<string> argumentArrayList;


ifstream inputFile("input.asm");
ofstream outputFile1("pass1output.asm"); //pass1 output


int pass1(){
   
    if (!inputFile) {
        cerr << "Error opening input file!" << endl;
        return 1;
    }
   
    if (!outputFile1) {
        cerr << "Error opening output file!" << endl;
        return 1;
    }
   
    string line;
    int lineCount = 1;
    int foundEnd = 0;
   
    while (getline(inputFile, line)) {
        if (line.empty()) continue;
       
        // Check if line is a macro definition
        if (line.substr(0, 5) == "MACRO") {
            Macro macro;
            macro.name = line.substr(6);
            macroNameTable[macro.name] = macroDefinitionTable.size();
           
            // Read arguments
            getline(inputFile, line);
            macro.arguments.clear();
           
            size_t startPos = 0;
            size_t spacePos = line.find(' ');
            while (spacePos != string::npos) {
                string argument = line.substr(startPos, spacePos - startPos);
                if (argument[0] == '&')
                    argumentArrayList.push_back(argument);
                macro.arguments.push_back(argument);
               
                startPos = spacePos + 1;
                spacePos = line.find(' ', startPos);
            }
           
            // Read macro body
            while (getline(inputFile, line)) {
                if (line == "MEND"){
                    foundEnd = 1;
                    break;
                }
                macro.body += line + '\n';
            }
           
            macroDefinitionTable.push_back(macro);
        }
       
        // Write output file without macro definitions
        else {
            if(foundEnd==1) outputFile1 << line << endl;
        }
       
        lineCount++;
    }
   
    // Print macro name table
    cout << "Macro Name Table:" << endl;
    for (const auto& pair : macroNameTable) {
        cout << pair.first << " : " << pair.second << endl;
    }
    cout<<endl;
    // Print macro definition table
    cout << "Macro Definition Table:" << endl;
    for (const auto& macro : macroDefinitionTable) {
        cout <<macro.name << endl;
        // cout << "Arguments: ";
        for (const auto& argument : macro.arguments) {
            cout << argument << ' ';
        }
        cout << endl;
        // cout << "Body: " << endl;
        cout << macro.body << endl;
    }
   
    // Print argument array list
    cout << "Argument Array List:" << endl;
    int ptr=0;
    for (const auto& argument : argumentArrayList) {
        cout << ptr<<" "<<argument << endl;
        ptr++;
    }
   
    inputFile.close();
    outputFile1.close();
    return 0;
}


int pass2(){
    ifstream outputFile1("pass1output.asm");
    ofstream outputFile2("pass2output.asm");
   
    if (!outputFile1) {
        cerr << "Error opening input file!" << endl;
        return 1;
    }
   
    if (!outputFile2) {
        cerr << "Error opening output file!" << endl;
        return 1;
    }
   
    // map<string, int> macroNameTable;
    // vector<Macro> macroDefinitionTable;
    // vector<string> argumentArrayList;
   
    // Code to populate macroNameTable, macroDefinitionTable, and argumentArrayList
    // with the outputs obtained from pass-1
   
    string line;
    int lineCount = 1;
   
    while (getline(outputFile1, line)) {
        if (line.empty())
            continue;
       
        // Check if line is a macro call
        bool isMacroCall = false;
       
        for (const auto& pair : macroNameTable) {
            string macroName = pair.first;
            string macroCall = macroName + ' ';
           
            if (line.substr(0, macroCall.size()) == macroCall) {
                Macro macro = macroDefinitionTable[pair.second];
                map<string, string> argumentMapping;
               
                size_t startPos = macroCall.size();
                size_t spacePos = line.find(' ', startPos);
               
                for (const auto& argument : macro.arguments) {
                    if (startPos >= line.size())
                        break;
                   
                    string value;
                    if (argument[0] == '&') {
                        string argumentName = line.substr(startPos, spacePos - startPos);
                        argumentMapping[argument] = argumentName;
                        value = argumentName;
                    } else {
                        value = argument;
                    }
                     
                    startPos = spacePos + 1;
                    spacePos = line.find(' ', startPos);
                }
               
                // Expand macro call
                string expandedCode = macro.body;
                for (const auto& pair : argumentMapping) {
                    string argument = pair.first;
                    string value = pair.second;
                    size_t pos = expandedCode.find(argument);
                   
                    while (pos != string::npos) {
                        expandedCode.replace(pos, argument.size(), value);
                        pos = expandedCode.find(argument, pos + value.size());
                    }
                }
               
                outputFile2 << expandedCode;
                isMacroCall = true;
                break;
            }
        }
       
        if (!isMacroCall) {
            outputFile2 << line << endl;
        }
       
        lineCount++;
    }
   
    outputFile1.close();
    outputFile2.close();
    return 0;
}


int main() {
    pass1();
    pass2();
    return 0;
}



Syntax analysis (generate stream of tokens)
%option noyywrap
%{
    #include<stdio.h>
%}
letter [A-Za-z]
digit [0-9]
identifier {letter}({letter}|{digit})*
number {digit}{digit}*
operator [+|-|*|/|=]
keywords int|float|void|main|printf|scanf|return
punctuation [;|,|!|(|)|{|}]
header #.*
single_comment "//".*
multi_comment "/*".*."*/"


%%
{header} {printf("\nHeader: %s",yytext);}
{keywords} {printf("\nKeyword: %s",yytext);}
{identifier} {printf("\nIdentifier: %s",yytext);}
{number} {printf("\nNumber: %s",yytext);}
{operator} {printf("\nOperator: %s",yytext);}
{punctuation} {printf("\nPunctuation: %s",yytext);}
{single_comment} {printf("\nSingle-comment: %s",yytext);}
{multi_comment} {printf("\nMulti-comment: %s",yytext);}


%%


int main(){
    yyin = fopen("code.c", "r");
    yylex();
    return 0;
}

Validate type and syntax

Lex file

%{
    #include <stdio.h>
    #include "p.tab.h"    
%}


datatype int|float|char|double|string|boolean
letters [A-Za-z]
digits [0-9]
identifiers {letters}({letters}|{digits})*
comma [,]
SC [;]


%%
{datatype} {return datatype;}
{identifiers} {return identifiers;}
{comma} {return comma;}
{SC} {return SC;}
%%

%{
    #include <stdio.h>    
%}


YACC FILE
%token datatype identifiers comma SC


%%
    start:datatype varlist SC{printf("\nDS is Valid\n");}
    | varlist:varlist comma identifiers
    | identifiers
%%
int main(){
    printf("Enter Statement:\n");
    yyparse();
}
int yyerror(){
    printf("DS is invalid");
    return 0;
}
int yywrap(){
    return 0;
}

SIMPLE COMPound
%{
    #include "p.tab.h"
%}
%%
("and"|"or"|"but") {return COMPOUND;}
[A-Za-z]+ {return WORD;}
"." {return DOT;}
%%

%{
    #include <stdio.h>
%}
%token COMPOUND WORD DOT
%%
start: WORD_LIST COMPOUND WORD_LIST DOT {printf("Compund Statement");}
    |WORD_LIST DOT{printf("Simple statement");}
    |WORD_LIST:WORD WORD_LIST | WORD;
%%


int main(){
    printf("Enter sentence: \n");
    yyparse();
}
int yyerror(){
    return 0;
}
int yywrap(){
    return 0;
}

CPU SCHEDULING
// 1.fcfs
// 2.sjf
// 3.priority
// 4.round-robin
#include <stdio.h>
#include <bits/stdc++.h>
#include <iostream>
using namespace std;


void fcfs(int processes[], int n, int burst_time[]) {
    int waiting_time[n], turnaround_time[n];


    waiting_time[0] = 0;
    turnaround_time[0] = burst_time[0];


    for (int i = 1; i < n; i++) {
        waiting_time[i] = burst_time[i - 1] + waiting_time[i - 1];
        turnaround_time[i] = burst_time[i] + waiting_time[i];
    }


    printf("Process|Burst Time|Waiting Time|Turnaround Time\n");


    for (int i = 0; i < n; i++) {
        // printf("%d\t%d\t\t%d\t\t%d\n", processes[i], burst_time[i], waiting_time[i], turnaround_time[i]);
        cout<<processes[i]<<" "<<burst_time[i]<<" "<<waiting_time[i]<<" "<<turnaround_time[i]<<endl;
    }
}


void sjf(int processes[], int n, int burst_time[]) {
    int waiting_time[n], turnaround_time[n];
    int total = 0;


    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (burst_time[i] > burst_time[j]) {
                swap(burst_time[i], burst_time[j]);
                swap(processes[i], processes[j]);
            }
        }
        //now ith process is shortest process & is executed
        waiting_time[i] = total;
        total += burst_time[i];
        turnaround_time[i] = total; //total waiting + burst[i]
    }


    printf("Process\tBurst Time\tWaiting Time\tTurnaround Time\n");


    for (int i = 0; i < n; i++) {
        //printf("%d\t%d\t\t%d\t\t%d\n", processes[i], burst_time[i], waiting_time[i], turnaround_time[i]);
        cout<<processes[i]<<" "<<burst_time[i]<<" "<<waiting_time[i]<<" "<<turnaround_time[i]<<endl;
    }
}




void priority(int processes[], int n, int burst_time[], int priority[]) {
    int waiting_time[n], turnaround_time[n];
    int total = 0;


    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (priority[i] > priority[j]) {
                swap(burst_time[i], burst_time[j]);
                swap(processes[i], processes[j]);
                swap(priority[i], priority[j]);
            }
        }
        //now ith process has highest priority
        waiting_time[i] = total;
        total += burst_time[i];
        turnaround_time[i] = total;
    }


    printf("Process\tBurst Time\tPriority\tWaiting Time\tTurnaround Time\n");


    for (int i = 0; i < n; i++) {
        //printf("%d\t%d\t\t%d\t\t%d\t\t%d\n", processes[i], burst_time[i], priority[i], waiting_time[i], turnaround_time[i]);
        cout<<processes[i]<<" "<<burst_time[i]<<" "<<waiting_time[i]<<" "<<turnaround_time[i]<<endl;
    }
}




void round_robin(int processes[], int n, int burst_time[], int time_quantum) {
    int remaining_burst_time[n];
    int waiting_time[n], turnaround_time[n];
    int total_waiting_time = 0, total_turnaround_time = 0;


    for (int i = 0; i < n; i++) {
        remaining_burst_time[i] = burst_time[i];
    }


    int time = 0;
    while (1) {
        int all_processes_done = 1;


        for (int i = 0; i < n; i++) {
            if (remaining_burst_time[i] > 0) {
                all_processes_done = 0;


                if (remaining_burst_time[i] > time_quantum) {
                    time += time_quantum;
                    remaining_burst_time[i] -= time_quantum;
                } else {
                    time += remaining_burst_time[i];
                    waiting_time[i] = time - burst_time[i];
                    remaining_burst_time[i] = 0;
                }
            }
        }


        if (all_processes_done)
            break;
    }


    for (int i = 0; i < n; i++) {
        turnaround_time[i] = burst_time[i] + waiting_time[i];
        total_waiting_time += waiting_time[i];
        total_turnaround_time += turnaround_time[i];
    }


    printf("Process\tBurst Time\tWaiting Time\tTurnaround Time\n");


    for (int i = 0; i < n; i++) {
        //printf("%d\t%d\t\t%d\t\t%d\n", processes[i], burst_time[i], waiting_time[i], turnaround_time[i]);
        cout<<processes[i]<<" "<<burst_time[i]<<" "<<waiting_time[i]<<" "<<turnaround_time[i]<<endl;
    }


    printf("Average waiting time: %.2f\n", (float)total_waiting_time / n);
    printf("Average turnaround time: %.2f\n", (float)total_turnaround_time / n);
}






int main() {
    int processes[] = {1, 2, 3, 4};
    int burst_time[] = {10, 5, 8, 12};
    int priority1[] = {2, 1, 4, 3};
    int n = sizeof(processes) / sizeof(processes[0]);
    int time_quantum = 2;


    fcfs(processes, n, burst_time);
    sjf(processes, n, burst_time);
    priority(processes, n, burst_time, priority1);
    round_robin(processes, n, burst_time, time_quantum);


    return 0;
}

SYSTEM CALLS

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>
// int fork();
// int wait();
int main()
{
    char *ls_args[3] = {"ls", "-l", NULL};


    int c_pid = fork() ;


    if (c_pid == 0) //current process is child process
    {
        printf("\nChild executing...\nChild ID:");
        printf("%d\n", getpid());
        execvp(ls_args[0], ls_args);
        perror("\nexecvp failed");
    }
    else if (c_pid > 0) //current process is parent process
    {
        //If wait() fails (returns a negative value), an error message is printed using perror(), and the program exits with an error code.
        int status, pid;
        if (pid = wait(&status) < 0)
        {
            perror("\nwait");
            exit(1);
        }
        printf("\nParent Executing Process");
        printf("\nParent pid:");
        printf("%d\n", getpid());
    }
    // This block of code executes if the fork() call fails to create a child process (determined by c_pid < 0). It simply prints an error message and exits the program with an error code.
    else
    {
        printf("\nFork failed");
        exit(1);
    }
    return 0;
}




// The wait() function is a system call in Unix-like operating systems that allows a parent process to wait for the termination of its child process(es). It suspends the execution of the parent process until one of its child processes exits.


// status = exit status of child process
// WIFEXITED(), WEXITSTATUS()


// The wait() function allows the parent process to synchronize its execution with its child processes, ensuring that it does not proceed before the child processes have completed their execution.



Page replacement
// 1.FIFO  
// 2.LRU
// 3.Optimal
// A page fault happens when a running program accesses a memory page that is mapped into the virtual address space but not loaded in physical memory. Since actual physical memory is much smaller than virtual memory, page faults happen. In case of a page fault, Operating System might have to replace one of the existing pages with the newly needed page. Different page replacement algorithms suggest different ways to decide which page to replace. The target for all algorithms is to reduce the number of page faults.
#include <iostream>
#include <bits/stdc++.h>
#include <vector>
using namespace std;


// FIFO page replacement algorithm
int fifo(vector<int> pages, int frames) {
  int page_faults = 0;
  unordered_set<int>st;
  queue<int>q;


  for(int i=0; i<pages.size(); i++){
    if(st.size()<frames){
      if(!st.count(pages[i])){
        st.insert(pages[i]);
        q.push(pages[i]);
        page_faults++;
      }
    }
    else{
      if(!st.count(pages[i])){
        int temp = q.front();
        q.pop();
        st.erase(temp);
        st.insert(pages[i]);
        q.push(pages[i]);
        page_faults++;
      }
    }
  }


  return page_faults;
}


// LRU page replacement algorithm
// void print(deque<int>&q){
//  for(auto it=q.begin(); it!=q.end(); it++){
//    cout<<*it<<" ";
//  }
//  cout<<endl;
// }
int lru(vector<int> pages, int frames) {
  int page_faults = 0;
  deque<int>q(frames, -1);


  for(auto page:pages){
  auto itr = find(q.begin(), q.end(), page);
  if(!(itr != q.end())) {//page present
    ++page_faults;
    if(q.size()==frames){
      q.pop_front();
      q.push_back(page);
    }
    else{
      q.push_back(page);
    }
    }
  else{
    q.erase(itr);
    q.push_back(page);
  }
  }
  return page_faults;
}


// Optimal page replacement algorithm
int search(vector<int>&pages, set<int>&st, int pos){
  int farthest = -1, dist=-1;
  for(auto it:st){
    int curr_dist = -1;
    for(int i=pos; i<pages.size(); i++){
      if(pages[i]==it){
        curr_dist = i-pos;
        break;
      }
    }
    if(curr_dist==-1) return it;
    else{
      if(curr_dist>dist) {
        dist = curr_dist;
        farthest = it;
      }
    }
  }
  return farthest;
}


int optimal(vector<int> pages, int frames) {
  int page_faults = 0;
  set<int>st;


  for(int i=0; i<pages.size(); i++){
    if(st.size()<frames){ //slots full
      if(!st.count(pages[i])) { //not present
        st.insert(pages[i]);
        page_faults++;
      }
    }
    else{ //slots remaining
      if(!st.count(pages[i])) { //not present
        page_faults++;
        int farthest = search(pages, st, i);
        st.erase(farthest);
        st.insert(pages[i]);
      }
    }
  }


  return page_faults;
}


int main() {
  int frames=3;
//   cin >> frames;


  vector<int> pages = {7, 0, 1, 2,
               0, 3, 0, 4, 2, 3, 0, 3, 2, 1,
               2, 0, 1, 7, 0, 1};
//   for (int i = 0; i < frames; i++) {
//     cin >> pages[i];
//   }


  int fifo_page_faults = fifo(pages, frames);
  int lru_page_faults = lru(pages, frames);
  int optimal_page_faults = optimal(pages, frames);


  cout << "FIFO page faults: " << fifo_page_faults << endl;
  cout << "LRU page faults: " << lru_page_faults << endl;
  cout << "Optimal page faults: " << optimal_page_faults << endl;


  return 0;
}







