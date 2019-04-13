# ahdas-ruudukko-annealing
simulated annealing algorithm for solving putting numbers into a grid as small as possible (directions: vertical, horizontal, diagonal; all both ways).

The file simAnneal.js contains the algorithm that takes a class as parameter (this makes it more general). The class needs to know the usual stuff: how to make a random value, how to step to a neighboring value, also how to get the starting T (could be sampled as an average of energys, as in the case of Grid, it is).


The class Grid repserents the way we try to put all numbers into it. Its parameters (what NUMS to put and grid size MxN are static class variables).

Page index.html and main.js has a little interface for testing and viewing how the current state looks.
