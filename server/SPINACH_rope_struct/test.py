import spinach_rope as r

#
a = r.rope("hello,")
b = r.rope("world")
c = r.rope(" i am allen")

# print(r.strconcat("de","dejujijijijij"))
# print(a.get_str() + b.get_str())

d = r.concat(a, b)
e = r.concat(d, c)
# for i in range(20):
#     print(e.indexat(i))
print(e.get_str())

right = r.split(e, 10)
print(right.get_str())
print(e.get_str())

e = r.concat(e, right)
print(e.get_str())

e.insert(2, "continue last dying breath")
print(e.get_str())
e.delete(2, 3)
print(e.get_str())


