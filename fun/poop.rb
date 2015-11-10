require 'set'

rows,columns = `stty size`.scan(/\d+/).map{|x| x.to_i}

Poo = "💩"
Poop = ['💩','🌮']

PooState = Struct.new(:row, :speed, :shape)
poop_progress = {}
avail = Set.new 1..columns

puts "\033[2J"

def char_at(char,row,col) ; "\033[#{row};#{col}H#{char}" ; end

loop do
  column = avail.to_a[ rand( avail.size ) ]
  avail.delete column
  speed = rand( Poop.size )+1
  shape = Poop[speed-1]
  poop_progress[ column ] = PooState.new 0,speed,shape
  poop_progress.clone.each do |column, poo|
    print char_at(' ',poo.row,column) if poo.row > 0
    poo.row += poo.speed
    if poo.row < rows
      print char_at(poo.shape,poo.row,column)
    else
      print char_at(Poo,rows,column)
      avail << column
      poop_progress.delete column
    end
    print char_at('',0,0)
  end
  $stdout.flush
  sleep 0.06
end
